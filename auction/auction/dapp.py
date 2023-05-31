# Copyright 2022 Cartesi Pte. Ltd.
#
# SPDX-License-Identifier: Apache-2.0
# Licensed under the Apache License, Version 2.0 (the "License"); you may not use
# this file except in compliance with the License. You may obtain a copy of the
# License at http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software distributed
# under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
# CONDITIONS OF ANY KIND, either express or implied. See the License for the
# specific language governing permissions and limitations under the License.

import json
from os import environ
from urllib.parse import urlparse

import auction.wallet as wallet
import requests
from auction.auctioneer import Auctioneer
from auction.log import logger
from auction.outputs import Error, Log, Output
from auction.routing import Router
from auction.util import hex_to_str

logger.info("Auction DApp started")

rollup_server = environ["ROLLUP_HTTP_SERVER_URL"]
network = environ["NETWORK"]
logger.debug(f"Rollup server URL: {rollup_server}")
logger.info(f"Network is {network}")

# Setup contracts addresses
erc20_portal_file = open(f'./deployments/{network}/ERC20Portal.json')
erc20_portal = json.load(erc20_portal_file)

erc721_portal_file = open(f'./deployments/{network}/ERC721Portal.json')
erc721_portal = json.load(erc721_portal_file)

dapp_address_relay_file = open(f'./deployments/{network}/DAppAddressRelay.json')
dapp_address_relay = json.load(dapp_address_relay_file)

router = None


def send_request(output):
    if isinstance(output, Output):
        request_type = type(output).__name__.lower()
        endpoint = request_type
        if isinstance(output, Error):
            endpoint = "report"
            logger.warning(hex_to_str(output.payload))
        elif isinstance(output, Log):
            endpoint = "report"

        logger.debug(f"Sending {request_type}")
        response = requests.post(rollup_server + f"/{endpoint}",
                                 json=output.__dict__)
        logger.debug(f"Received {output.__dict__} status {response.status_code} "
                     f"body {response.content}")
    else:
        for item in output:
            send_request(item)


def handle_advance(data):
    logger.debug(f"Received advance request data {data}")
    try:
        msg_sender = data["metadata"]["msg_sender"]
        payload = data["payload"]

        if msg_sender.lower() == dapp_address_relay['address'].lower():
            logger.debug("Setting DApp address")
            rollup_address = payload
            router.set_rollup_address(rollup_address)
            return Log(f"DApp address set up successfully to {rollup_address}.")

        # It is an ERC20 deposit
        if msg_sender.lower() == erc20_portal['address'].lower():
            try:
                return router.process("erc20_deposit", payload)
            except Exception as error:
                error_msg = f"Failed to process ERC20 deposit '{payload}'. {error}"
                logger.debug(error_msg, exc_info=True)
                return Error(error_msg)
        elif msg_sender.lower() == erc721_portal['address'].lower():
            try:
                return router.process("erc721_deposit", payload)
            except Exception as error:
                error_msg = f"Failed to process ERC721 deposit '{payload}'. {error}"
                logger.debug(error_msg, exc_info=True)
                return Error(error_msg)
        else:
            try:
                str_payload = hex_to_str(payload)
                payload = json.loads(str_payload)
                return router.process(payload["method"], data)
            except Exception as error:
                error_msg = f"Failed to process command '{str_payload}'. {error}"
                logger.debug(error_msg, exc_info=True)
                return Error(error_msg)

    except Exception as error:
        error_msg = f"Failed to process advance_request. {error}"
        logger.debug(error_msg, exc_info=True)
        return Error(error_msg)


def handle_inspect(data):
    logger.debug(f"Received inspect request data {data}")
    try:
        url = urlparse(hex_to_str(data["payload"]))
        return router.process(url.path, data)
    except Exception as error:
        error_msg = f"Failed to process inspect request. {error}"
        logger.debug(error_msg, exc_info=True)
        return Error(error_msg)


handlers = {
    "advance_state": handle_advance,
    "inspect_state": handle_inspect,
}

finish = {"status": "accept"}

auctioneer = Auctioneer(wallet)
router = Router(wallet, auctioneer)

while True:
    logger.debug("Sending finish")
    response = requests.post(rollup_server + "/finish", json=finish)
    logger.debug(f"Received finish status {response.status_code}")
    if response.status_code == 202:
        logger.debug("No pending rollup request, trying again")
    else:
        rollup_request = response.json()
        data = rollup_request["data"]

        handler = handlers[rollup_request["request_type"]]
        output = handler(rollup_request["data"])

        finish["status"] = "accept"
        if isinstance(output, Error):
            finish["status"] = "reject"

        send_request(output)

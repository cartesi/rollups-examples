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


from os import environ
import traceback
import logging
import requests
import json
from eth_abi.abi import encode
from eth_abi_ext import decode_packed

logging.basicConfig(level="INFO")
logger = logging.getLogger(__name__)

rollup_server = environ["ROLLUP_HTTP_SERVER_URL"]
network = environ["NETWORK"]

logger.info(f"HTTP rollup_server url is {rollup_server}")
logger.info(f"Network is {network}")

# Function selector to be called during the execution of a voucher that transfers funds,
# which corresponds to the first 4 bytes of the Keccak256-encoded result of "withdrawEther(address,uint256)"
WITHDRAW_FUNCTION_SELECTOR = b'R/h\x15'

# Setup contracts addresses
dapp_address_relay_file = open(f'./deployments/{network}/DAppAddressRelay.json')
dapp_address_relay = json.load(dapp_address_relay_file)

ETHERPortalFile = open(f'./deployments/{network}/EtherPortal.json')
etherPortal = json.load(ETHERPortalFile) 

rollup_address = None

def str2hex(str):
    """
    Encode a string as an hex string
    """
    return "0x" + str.encode("utf-8").hex()

def reject_input(msg, payload):
    logger.error(msg)
    response = requests.post(rollup_server + "/report", json={"payload": payload})
    logger.info(f"Received report status {response.status_code} body {response.content}")
    return "reject"

def handle_advance(data):
    global rollup_address
    logger.info(f"Received advance request data {data}")

    try:
        if data["metadata"]["msg_sender"].lower() == dapp_address_relay['address'].lower():
            logger.debug("Setting DApp address")
            rollup_address = data["payload"]
            return "accept"
        elif data["metadata"]["msg_sender"].lower() != etherPortal['address'].lower():
            return reject_input(f"Input does not come from the ETHER Portal", data["payload"])
        
        if rollup_address is None:
            return reject_input(f"Set the Rollup Address First", data["payload"])

        # Attempt to decode input as an ABI-packed-encoded ERC20 deposit
        binary = bytes.fromhex(data["payload"][2:])
        try:
            decoded = decode_packed(['address','uint256'],binary)
        except Exception as e:
            msg = "Payload does not conform to ERC20 deposit ABI"
            logger.error(f"{msg}\n{traceback.format_exc()}")
            return reject_input(msg, data["payload"])

        depositor = decoded[0]
        amount = decoded[1]
        
        # Post notice about the deposit
        notice_str = f"Deposit received from: {depositor}; ETH Amount: {amount}"
        logger.info(f"Adding notice: {notice_str}")
        notice = {"payload": str2hex(notice_str)}
        response = requests.post(rollup_server + "/notice", json=notice)
        logger.info(f"Received notice status {response.status_code} body {response.content}")

        # Encode the withdrawEther function call that returns the amount back to the depositor
        withdraw_payload = WITHDRAW_FUNCTION_SELECTOR + encode(['address','uint256'], [depositor, amount])
        # Post voucher executing the withdrawEther on the DApp contract: "I don't want your money"!
        voucher = {"destination": rollup_address, "payload": "0x" + withdraw_payload.hex()}
        logger.info(f"Issuing voucher {voucher}")
        response = requests.post(rollup_server + "/voucher", json=voucher)
        logger.info(f"Received voucher status {response.status_code} body {response.content}")

        return "accept"

    except Exception as e:
        return reject_input(f"Error processing data {data}\n{traceback.format_exc()}")

def handle_inspect(data):
    logger.info(f"Received inspect request data {data}")
    logger.info("Adding report")
    response = requests.post(rollup_server + "/report", json={"payload": data["payload"]})
    logger.info(f"Received report status {response.status_code}")
    return "accept"

handlers = {
    "advance_state": handle_advance,
    "inspect_state": handle_inspect,
}

finish = {"status": "accept"}

while True:
    logger.info("Sending finish")
    response = requests.post(rollup_server + "/finish", json=finish)
    logger.info(f"Received finish status {response.status_code}")
    if response.status_code == 202:
        logger.info("No pending rollup request, trying again")
    else:
        rollup_request = response.json()
        data = rollup_request["data"]
        
        handler = handlers[rollup_request["request_type"]]
        finish["status"] = handler(rollup_request["data"])

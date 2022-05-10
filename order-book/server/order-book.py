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
from src import orders, products, transactions

logging.basicConfig(level="INFO")
logger = logging.getLogger(__name__)

rollup_server = environ["ROLLUP_HTTP_SERVER_URL"]
logger.info(f"HTTP rollup_server url is {rollup_server}")

def hex2str(hex):
    """
    Decodes a hex string into a regular string
    """
    return bytes.fromhex(hex[2:]).decode("utf-8")


def str2hex(str):
    """
    Encodes a string as a hex string
    """
    return "0x" + str.encode("utf-8").hex()
    
def handle_advance(data):
    logger.info(f"Received advance request data {data}")
    logger.info("Adding notice")
    try:
        payload = json.loads(hex2str(data["payload"]))
        sender = data["metadata"]["msg_sender"]
        logger.info(f"Decoded payload: {payload}, sender: {sender}")

        if payload["resource"] == "order":
            response_payload = orders.handle_order(sender, payload, logger)
        elif payload["resource"] == "product":
            response_payload = products.handle_product(sender, payload, logger)
        elif payload["resource"] == "transaction":
            response_payload = transactions.handle_transaction(sender, payload, logger)
        elif payload["resource"] == "test":
            response_payload = {"status": {"success": True, "message": "test input received" }}
        else:
            response_payload = {"status": {"success": False, "message": "no or unsupported resource specified" }}

        response_payload = json.dumps(response_payload)
        response = requests.post(rollup_server + "/notice", json={"payload": str2hex(response_payload)})
        logger.info(f"Received notice status {response.status_code} body {response.content}")
        return "accept"
     
    except Exception as e:
        msg = f"Error processing body {data}\n{traceback.format_exc()}"
        logger.error(msg)
        response = requests.post(rollup_server + "/report", json={"payload": str2hex(msg)})
        logger.info(f"Received report status {response.status_code} body {response.content}")
        return "reject"

def handle_inspect(data):
    logger.info(f"Received inspect request data {data}")
    logger.info("Adding report")
    report = {"payload": data["payload"]}
    response = requests.post(rollup_server + "/report", json=report)
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
        handler = handlers[rollup_request["request_type"]]
        finish["status"] = handler(rollup_request["data"])
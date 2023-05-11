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
from typing import Any
import requests
import json
from eth_abi import  encode_abi

logging.basicConfig(level="INFO")
logger = logging.getLogger(__name__)

rollup_server = environ["ROLLUP_HTTP_SERVER_URL"]
network = environ["NETWORK"]

logger.info(f"HTTP rollup_server url is {rollup_server}")
logger.info(f"Network is {network}")

# Function selector to be called during the execution of a voucher that transfers funds,
# which corresponds to the first 4 bytes of the Keccak256-encoded result of "transfer(address,uint256)"
TRANSFER_FUNCTION_SELECTOR = b'\xa9\x05\x9c\xbb'

# Setup contracts addresses
ERC20PortalFile = open(f'./deployments/{network}/ERC20Portal.json')
erc20Portal = json.load(ERC20PortalFile) 

bytes_types = (bytes, bytearray)

def is_bytes(value: Any) -> bool:
    return isinstance(value, bytes_types)

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

def decode_abi_packed_boolean(binary):
    if binary == b'\x00':
            return False
    elif binary == b'\x01':
            return True
    raise Exception(
                "Boolean must be either 0x0 or 0x1.  Got: {0}".format(repr(data))
            )

def decode_abi_packed(types,binary):

    if not is_bytes(binary):
            raise TypeError("The `data` value must be of bytes type.  Got {0}".format(type(data)))

    current_byte_index = 0
    decoded = []
    for type in types:
        if type == 'bool':
            next_data_index = current_byte_index+1
            decoded.append(decode_abi_packed_boolean(binary[current_byte_index:next_data_index]))
            current_byte_index = next_data_index
        elif type == 'address' :
            next_data_index = current_byte_index+20
            decoded.append('0x'+binary[current_byte_index:next_data_index].hex())
            current_byte_index = next_data_index
        elif type == 'uint256' :
            next_data_index = current_byte_index+32
            decoded.append(int.from_bytes(binary[current_byte_index:next_data_index],'big'))
        else :
            raise Exception(f"Unhadled type {type}")
    return decoded


def handle_advance(data):
    logger.info(f"Received advance request data {data}")

    try:
        # Check wether an input was sent by the ERC20 Portal,
        # which is where all deposits must come from
        if data["metadata"]["msg_sender"].lower() != erc20Portal['address'].lower():
            return reject_input(f"Input does not come from the ERC20 Portal", data["payload"])

        # Attempt to decode input as an ABI-packed-encoded ERC20 deposit
        binary = bytes.fromhex(data["payload"][2:])
        try:
            decoded = decode_abi_packed(['bool', 'address', 'address', 'uint256'], binary)
        except Exception as e:
            msg = "Payload does not conform to ERC20 deposit ABI"
            logger.error(f"{msg}\n{traceback.format_exc()}")
            return reject_input(msg, data["payload"])

        success = decoded[0]
        erc20 = decoded[1]
        depositor = decoded[2]
        amount = decoded[3]
        
        # Post notice about the deposit
        notice_str = f"Deposit received from: {depositor}; ERC-20: {erc20}; Amount: {amount}"
        logger.info(f"Adding notice: {notice_str}")
        notice = {"payload": str2hex(notice_str)}
        response = requests.post(rollup_server + "/notice", json=notice)
        logger.info(f"Received notice status {response.status_code} body {response.content}")

        # Encode a transfer function call that returns the amount back to the depositor
        transfer_payload = TRANSFER_FUNCTION_SELECTOR + encode_abi(['address','uint256'], [depositor, amount])
        # Post voucher executin,,lllg the transfer on the ERC-20 contract: "I don't want your money"!
        voucher = {"address": erc20, "payload": "0x" + transfer_payload.hex()}
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

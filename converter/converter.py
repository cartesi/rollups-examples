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
import traceback
import logging
import random
from os import environ

import requests

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


# 
# Custom transformations
#
def reverse_transformation(text):
    """
    Reverses a given string so that the first character becomes the last one
    """
    return text[::-1]

def alternate_transformation(text):
    """
    Alternates the capitalization of a string's characters
    """
    return "".join(
        [char.lower() if index % 2 else char.upper()
         for index, char in enumerate(text)]
    )

def random_transformation(text):
    """
    "Randomizes" the capitalization of a string's characters

    Keep in mind that the seed of the pseudo-random function is known, so in practice
    this is just a non-trivial way of making some characters upper case and others
    lower case.
    """
    return "".join(
        [char.upper() if random.randint(0, 1) == 1 else char.lower()
         for char in text]
    )


def handle_advance(data):
    # defines supported transformations
    transformations = {
        "upper": str.upper,
        "lower": str.lower,
        "capitalize": str.capitalize,
        "reverse": reverse_transformation,
        "alternate": alternate_transformation,
        "random": random_transformation,
    }

    logger.info(f"Received advance request data {data}")

    status = "accept"
    try:
        input = json.loads(hex2str(data["payload"]))
        logger.info(f"Received input: {input}")

        # collects conversion parameters
        transform = input["transform"]
        message = input["message"]

        # performs conversion
        output = transformations[transform](message)

        # emits output notice with transformed message
        logger.info(f"Adding notice with payload: '{output}'")
        requests.post(rollup_server + "/notice", json={"payload": str2hex(output)})

    except Exception as e:
        status = "reject"
        msg = f"Error processing data {data}\n{traceback.format_exc()}"
        logger.error(msg)
        response = requests.post(rollup_server + "/report", json={"payload": str2hex(msg)})
        logger.info(f"Received report status {response.status_code} body {response.content}")

    return status


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

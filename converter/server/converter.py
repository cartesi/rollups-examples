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
from flask import Flask, request

app = Flask(__name__)
app.logger.setLevel(logging.INFO)

dispatcher_url = environ["HTTP_DISPATCHER_URL"]
app.logger.info(f"HTTP dispatcher url is {dispatcher_url}")


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


@app.route("/advance", methods=["POST"])
def advance():
    # defines supported transformations
    transformations = {
        "upper": str.upper,
        "lower": str.lower,
        "capitalize": str.capitalize,
        "reverse": reverse_transformation,
        "alternate": alternate_transformation,
        "random": random_transformation,
    }

    body = request.get_json()
    app.logger.info(f"Received advance request body {body}")

    status = "accept"
    try:
        input = json.loads(hex2str(body["payload"]))
        app.logger.info(f"Received input: {input}")

        # collects conversion parameters
        transform = input["transform"]
        message = input["message"]

        # performs conversion
        output = transformations[transform](message)

        # emits output notice with transformed message
        app.logger.info(f"Adding notice with payload: '{output}'")
        requests.post(dispatcher_url + "/notice", json={"payload": str2hex(output)})

    except Exception as e:
        status = "reject"
        msg = f"Error processing body {body}\n{traceback.format_exc()}"
        app.logger.error(msg)
        response = requests.post(dispatcher_url + "/report", json={"payload": str2hex(msg)})
        app.logger.info(f"Received report status {response.status_code} body {response.content}")

    app.logger.info("Finishing")
    response = requests.post(dispatcher_url + "/finish", json={"status": status})
    app.logger.info(f"Received finish status {response.status_code}")
    return "", 202


@app.route("/inspect/<payload>", methods=["GET"])
def inspect(payload):
    app.logger.info(f"Received inspect request payload {payload}")
    return {"reports": [{"payload": payload}]}, 200

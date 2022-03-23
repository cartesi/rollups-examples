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
import logging
import random
from os import environ

import requests
from flask import Flask, request

app = Flask(__name__)
app.logger.setLevel(logging.INFO)

dispatcher_url = environ["HTTP_DISPATCHER_URL"]
app.logger.info(f"HTTP dispatcher url is {dispatcher_url}")


def unserialize(data):
    raw_data = bytes.fromhex(data).decode("utf-8")
    data = json.loads(raw_data)

    return data


def serialize(data):
    return "0x" + data.encode("utf-8").hex()


# Custom transformations
def reversed_transformation(text):
    return text[::-1]


def alternated_transformation(text):
    return "".join(
        [char.lower() if index % 2 else char.upper()
         for index, char in enumerate(text)]
    )


def random_transformation(text):
    return "".join(
        [char.upper() if random.randint(0, 1) == 1 else char.lower()
         for char in text]
    )


@app.route("/advance", methods=["POST"])
def advance():
    transformations = {
        "upper": str.upper,
        "lower": str.lower,
        "capitalize": str.capitalize,
        "reversed": reversed_transformation,
        "alternated": alternated_transformation,
        "random": random_transformation,
    }

    body = request.get_json()

    payload = unserialize(body["payload"][2:])
    app.logger.info("[APP] Unserialized payload: " + str(payload))

    transform = payload["transform"]
    message = payload["message"]

    # Happy path
    message_transformed = transformations[transform](message)

    message_serialized = serialize(message_transformed)
    requests.post(dispatcher_url + "/notice",
                  json={"payload": message_serialized})
    requests.post(dispatcher_url + "/finish", json={"status": "accept"})

    app.logger.info("[HAPPY PATH] Tranformed message: " + message_transformed)
    app.logger.info("[APP] Serialized message: " + message_serialized)

    return "", 202


@app.route("/inspect/<payload>", methods=["GET"])
def inspect(payload):
    app.logger.info(f"Received inspect request payload {payload}")
    return {"reports": [{"payload": payload}]}, 200

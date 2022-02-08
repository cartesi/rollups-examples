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


import logging
from os import environ

import requests
from flask import Flask, request

app = Flask(__name__)
app.logger.setLevel(logging.INFO)

dispatcher_url = environ["HTTP_DISPATCHER_URL"]
app.logger.info(f"HTTP dispatcher url is {dispatcher_url}")


def unserialize(data):
    return bytes.fromhex(data).decode("utf-8")


def serialize(data):
    return "0x" + data.encode("utf-8").hex()


@app.route("/advance", methods=["POST"])
def advance():
    transformations = {
        "upper": str.upper,
        "lower": str.lower,
    }

    body = request.get_json()

    payload = unserialize(body["payload"][2:])
    app.logger.info("[APP] Unserialized payload: " + payload)

    transform = payload["transform"]
    message = payload["message"]

    # Error path
    if transform not in transformations:
        error_message = "Cannot do the '" + transform + "' transformation"
        error_serialize = serialize(error_message)
        requests.post(dispatcher_url + "/notice", json={"payload": error_message})
        requests.post(dispatcher_url + "/finish", json={"status": "accept"})

        app.logger.info("[ERROR PATH] Error message: " + error_message)
        app.logger.info("[APP] Error message serialized: " + error_serialize)

        return "", 202

    # Happy path
    message_tranformed = transformations[transform](message)

    message_serialized = serialize(message_tranformed)
    requests.post(dispatcher_url + "/notice", json={"payload": message_serialized})
    requests.post(dispatcher_url + "/finish", json={"status": "accept"})

    app.logger.info("[HAPPY PATH] Tranformed message: " + message_tranformed)
    app.logger.info("[APP] Serialized message: " + message_serialized)

    return "", 202


@app.route("/inspect/<payload>", methods=["GET"])
def inspect(payload):
    app.logger.info(f"Received inspect request payload {payload}")
    return {"reports": [{"payload": payload}]}, 200

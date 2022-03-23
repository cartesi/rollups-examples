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
import sqlite3
import json
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


@app.route("/advance", methods=["POST"])
def advance():
    body = request.get_json()
    app.logger.info(f"Received advance request body {body}")

    status = "accept"
    try:
        # retrieves SQL statement from input payload
        statement = hex2str(body["payload"])
        app.logger.info(f"Received statement: '{statement}'")

        # connects to internal database
        con = sqlite3.connect("data.db")
        cur = con.cursor()

        result = None
        status = "accept"
        try:
            # attempts to execute the statement and fetch any results
            cur.execute(statement)
            result = cur.fetchall()

        except Exception as e:
            status = "reject"
            msg = f"Error executing statement '{statement}': {e}"
            app.logger.error(msg)
            response = requests.post(dispatcher_url + "/report", json={"payload": str2hex(msg)})
            app.logger.info(f"Received report status {response.status_code} body {response.content}")

        finally:
            # closes connection to database
            con.commit()
            con.close()

        if (result):
            # if there is a result, converts it to JSON and posts it as a notice
            payloadJson = json.dumps(result)
            payload = str2hex(payloadJson)
            app.logger.info(f"Adding notice with payload: {payloadJson}")
            response = requests.post(dispatcher_url + "/notice", json={"payload": payload})
            app.logger.info(f"Received notice status {response.status_code} body {response.content}")

    except Exception as e:
        status = "reject"
        msg = f"Error processing body {body}\n{traceback.format_exc()}"
        app.logger.error(msg)
        response = requests.post(dispatcher_url + "/report", json={"payload": str2hex(msg)})
        app.logger.info(f"Received report status {response.status_code} body {response.content}")

    # finishes processing of the input
    app.logger.info("Finishing")
    response = requests.post(dispatcher_url + "/finish", json={"status": status})
    app.logger.info(f"Received finish status {response.status_code}")
    return "", 202


@app.route("/inspect/<payload>", methods=["GET"])
def inspect(payload):
    app.logger.info(f"Received inspect request payload {payload}")
    return {"reports": [{"payload": payload}]}, 200

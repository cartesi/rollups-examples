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
import sys

logging.basicConfig(level="INFO")
logger = logging.getLogger(__name__)

rollup_server = environ["ROLLUP_HTTP_SERVER_URL"]
logger.info(f"HTTP rollup_server url is {rollup_server}")

# connects to internal database
con = sqlite3.connect("data.db")


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

def post(endpoint, payloadStr, logLevel):
    logger.log(logLevel, f"Adding {endpoint} with payload: {payloadStr}")
    payload = str2hex(payloadStr)
    response = requests.post(f"{rollup_server}/{endpoint}", json={"payload": payload})
    logger.info(f"Received {endpoint} status {response.status_code} body {response.content}")


def handle_request(data, request_type):
    logger.info(f"Received {request_type} data {data}")

    status = "accept"
    try:
        # retrieves SQL statement from input payload
        statement = hex2str(data["payload"])
        logger.info(f"Processing statement: '{statement}'")

        # retrieves a cursor to the internal database
        try:
            cur = con.cursor()
        except Exception as e:
            # critical error if database is no longer accessible: DApp can no longer proceed
            msg = f"Critical error connecting to database: {e}"
            post("exception", msg, logging.ERROR)
            sys.exit(1)

        result = None
        status = "accept"
        try:
            # attempts to execute the statement and fetch any results
            cur.execute(statement)
            result = cur.fetchall()

        except Exception as e:
            status = "reject"
            msg = f"Error executing statement '{statement}': {e}"
            post("report", msg, logging.ERROR)

        if result:
            # if there is a result, converts it to JSON and posts it as a notice or report
            payloadJson = json.dumps(result)
            if request_type == "advance_state":
                post("notice", payloadJson, logging.INFO)
            else:
                post("report", payloadJson, logging.INFO)

    except Exception as e:
        status = "reject"
        msg = f"Error processing data {data}\n{traceback.format_exc()}"
        post("report", msg, logging.ERROR)

    return status


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
        
        finish["status"] = handle_request(data, rollup_request["request_type"])

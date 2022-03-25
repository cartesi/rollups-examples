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
import model
import json
import traceback
import logging
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

# Make Predictions with LogisticRegression from Scikit learn + m2gen on the Titanic Dataset

#generated from m2gen and model.py
def prediction(input):    
    score = model.score(input)
    class_index = None
    if isinstance(score, list):
        class_index = score.index(max(score))
    else:
        if (score > 0):
            class_index = 1
        else:
            class_index = 0
    return model.classes[class_index]

def format(input):
    output = []
    for i in range(len(input)):
        entry = input[i]
        formatted_entry = {}
        for key in entry.keys():
            if key in model.columns:
                formatted_entry[key] = entry[key]
            else:
                ohe_key = key + "_" + entry[key]
                ohe_key_missing = key + "_nan"
                if ohe_key in model.columns:
                    formatted_entry[ohe_key] = 1
                else:
                    formatted_entry[ohe_key_missing] = 1
        output_entry = []
        for column in model.columns:
            if column in formatted_entry:
                output_entry.append(formatted_entry[column])
            else:
                output_entry.append(0)
        output.append(output_entry)
    return output


# Cartesi Endpoint
@app.route("/advance", methods=["POST"])
def predict():
    body = request.get_json()
    app.logger.info(f"Received advance request body {body}")

    status = "accept"
    try:
        partial = body["payload"][2:]

        content = bytes.fromhex(partial).decode("utf-8")
        app.logger.info("Printing all inputs : " + content)
        json_ = json.loads(content)
        array = format(json_)
        print(f"Formatted input: {array}")
        out_array = []
        for i in range(len(array)):
            out_array.append(prediction(array[i]))
        app.logger.info({'prediction for all inputs': str(out_array)})

        # Encode back to Hex to add in the notice
        newpayload = "0x" + str(str(out_array).encode("utf-8").hex())
        app.logger.info("Predicted in Hex: " + newpayload)
        body["payload"] = newpayload
        app.logger.info("New PayLoad Added: " + body["payload"])
        app.logger.info("Adding notice")
        response = requests.post(
            dispatcher_url + "/notice", json={"payload": body["payload"]}
        )
        app.logger.info(
            f"Received notice status {response.status_code} body {response.content}"
        )

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

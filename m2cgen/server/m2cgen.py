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


def classify(input): 
    """
    Predicts a given input's classification using the model generated with m2cgen
    """
    # computes the score from the input
    score = model.score(input)

    # interprets the score to retrieve the predicted class index
    class_index = None
    if isinstance(score, list):
        class_index = score.index(max(score))
    else:
        if (score > 0):
            class_index = 1
        else:
            class_index = 0

    # returns the class specified by the predicted index
    return model.classes[class_index]


def format(input):
    """
    Transforms a given input so that it is in the format expected by the m2cgen model
    """
    formatted_input = {}
    for key in input.keys():
        if key in model.columns:
            # key in model: just copy the value
            formatted_input[key] = input[key]
        else:
            # key not in model: it may need to be transformed due to One Hot Encoding
            # - in OHE, there is a column for each possible key/value combination
            # - a OHE column has value 1 if the entry contains the key/value combination
            # - for each key, there is an extra column <key>_nan for unknown values
            ohe_key = key + "_" + str(input[key])
            ohe_key_unknown = key + "_nan"
            if ohe_key in model.columns:
                formatted_input[ohe_key] = 1
            else:
                formatted_input[ohe_key_unknown] = 1

    # builds output as a list/array with one entry for each column in the model
    output = []
    for column in model.columns:
        if column in formatted_input:
            # uses known value for columns present in input
            output.append(formatted_input[column])
        else:
            # uses value 0 for columns not present in the input (all other OHE columns)
            output.append(0)
    return output


@app.route("/advance", methods=["POST"])
def predict():
    body = request.get_json()
    app.logger.info(f"Received advance request body {body}")

    status = "accept"
    try:
        # retrieves input as string
        input = hex2str(body["payload"])
        app.logger.info(f"Received input: '{input}'")

        # converts input to the format expected by the m2cgen model
        input_json = json.loads(input)
        input_formatted = format(input_json)

        # computes predicted classification for input        
        predicted = classify(input_formatted)
        app.logger.info(f"Data={input}, Predicted: {predicted}")

        # emits output notice with predicted class name
        output = str2hex(str(predicted))
        app.logger.info(f"Adding notice with payload: {predicted}")
        response = requests.post(dispatcher_url + "/notice", json={"payload": output})
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

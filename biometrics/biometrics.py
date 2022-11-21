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

from genericpath import exists
from os import environ
import os, sys
import model
import json
import traceback
import logging
import requests
import base64
import time


startTime = time.time()

logging.basicConfig(level="INFO")
logger = logging.getLogger(__name__)

rollup_server = environ["ROLLUP_HTTP_SERVER_URL"]
logger.info(f"HTTP rollup_server url is {rollup_server}")


def get_uptime():
    """
    Returns the number of seconds since the program started.
    """
    # do return startTime if you just want the process start time
    return time.time() - startTime


def clear_disk():
    current_dir = os.getcwd()
    list = os.listdir(current_dir)

    # Delete histograms, png files and temporary files
    for item in list:
        if (
            item.endswith("_hist.txt")
            or item.endswith("_string64.txt")
            or item.endswith(".png")
        ):
            os.remove(os.path.join(current_dir, item))
    global startTime
    startTime = time.time()


def verify_payload(data):
    try:
        input = hex2str(data["payload"])
        input_json = json.loads(input)
        return input_json
    except:
        logger.info("Not a valid Payload for Image processing")


def str642img(str, name):
    try:
        imgdata = base64.b64decode(str)
        with open(name, "wb") as f:
            f.write(imgdata)
    except:
        print("Error while decoding")


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


def input_treatment(cnt, eps=1e-7):
    """
    Does operations in the raw histogram
    """
    parts = []
    for i in range(len(cnt)):
        cnt[i] = cnt[i].replace(";\n", "")
        cnt[i] = cnt[i].replace("\n", "")
        cnt[i] = cnt[i].replace("[", "")
        cnt[i] = cnt[i].replace("]", "")
        cnt[i] = cnt[i].replace(" ", "")
        cnt[i] = cnt[i].replace(",", " ")
        parts = cnt[i].split()

    # normalize histogram
    for i in range(len(parts)):
        parts[i] = float(parts[i])
    soma = sum(parts)
    for i in range(len(parts)):
        parts[i] /= soma + eps
    return parts


def classify(input):
    """
    Predicts a given input's classification using the model generated with m2cgen
    """
    # computes the score from the input
    score = model.score(input)
    if score > 0:
        finger_class = "Live"
    else:
        finger_class = "fake"

    # returns the class
    return finger_class


def handle_advance(data):
    status = "accept"
    logger.info(f"Uptime : {get_uptime()}")

    msg_sender = data["metadata"]["msg_sender"]
    logger.info(f"Message Sender  : {msg_sender}")

    # clears disc if the time is higher than 24 hours
    if get_uptime() > 3600:
        clear_disk()

    try:
        # retrieves input as string
        input_json = verify_payload(data)
        if input_json is None:
            status = "reject"
            return status

        loaded = False

        # check if the image is divided in chunks or it is only one chunk
        # Start check inputs. When we receive a chunk with final tag we turn loaded for true and call opencv. Otherwise we just add the content in the temporary file.
        text_fn = (
            msg_sender
            + "_"
            + (os.path.splitext(input_json["imageId"])[0])
            + "_string64.txt"
        )
        #check if file already exists. If true, check the current chunk. If the chunk is initial and the file exists, delete the existing file in disk.
        if os.path.exists(text_fn):
            if input_json["chunk"] == "initial":
                os.remove(text_fn)

        with open(text_fn, "a") as text_file:
            text_file.write(input_json["content"])
        if input_json["chunk"] == "final":
            loaded = True
            print("You can now load opencv")
        # if loaded = true, convert string64 to img and then calls opencv. At the end, turn loaded = false.
        if loaded:
            with open(text_fn) as f:
                lines = f.read().rstrip()
            # Convert the string to image
            img_name = msg_sender + "_" + input_json["imageId"]
            str642img(lines, img_name)
            # call opencv feature extractor binary to get the histogram
            os.environ["LD_LIBRARY_PATH"] = "/mnt/dapp/opencv/lib"
            cmd = "./fexrvv -i " + img_name
            so = os.popen(cmd).read()
            print(so)
            loaded = False
            # reads the generated histogram
            img_hist = (
                msg_sender
                + "_"
                + (os.path.splitext(input_json["imageId"])[0])
                + "_hist.txt"
            )
            os.rename("hist.txt", img_hist)
            hist_file = open(img_hist, "r")
            hist = hist_file.readlines()
            # Treats the histogram generated by c++
            hist = input_treatment(hist)
            # computes predicted classification for input
            predicted = classify(hist)
            logger.info(f"Data ={img_name}, Predicted: {predicted}")
            # delete all files created to clean space
            os.remove(img_name)
            os.remove(img_hist)
            os.remove(text_fn)

            # emits output notice with predicted class name
            output = str2hex(str(predicted))
            logger.info(f"Adding notice with payload: {predicted}")
            response = requests.post(
                rollup_server + "/notice", json={"payload": output}
            )
            logger.info(
                f"Received notice status {response.status_code} body {response.content}"
            )
        else:
            # emits output notice with "Image not loaded"
            output = str2hex("Image not loaded")
            logger.info(f"Adding notice with payload: {output}")
            response = requests.post(
                rollup_server + "/notice", json={"payload": output}
            )
            logger.info(
                f"Received notice status {response.status_code} body {response.content}"
            )

    except Exception as e:
        status = "reject"
        msg = f"Error processing data {data}\n{traceback.format_exc()}"
        logger.error(msg)
        response = requests.post(
            rollup_server + "/report", json={"payload": str2hex(msg)}
        )
        logger.info(
            f"Received report status {response.status_code} body {response.content}"
        )

    return status


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

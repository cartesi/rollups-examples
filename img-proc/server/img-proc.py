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
import json
import os
import base64
import subprocess


logging.basicConfig(level="INFO")
logger = logging.getLogger(__name__)

rollup_server = environ["ROLLUP_HTTP_SERVER_URL"]
logger.info(f"HTTP rollup_server url is {rollup_server}")

def hex2str(hex):
    return bytes.fromhex(hex[2:]).decode("utf-8")

def str2hex(str):
    return "0x" + str.encode("utf-8").hex()

def str642img(str,name):
    imgdata = base64.b64decode(str)
    filename = name+'.jpg'
    with open(filename, 'wb') as f:
        f.write(imgdata)
    

def handle_advance(data):
    logger.info(f"Received advance request data {data}")

    status = "accept"
    try:
         # retrieves input as string
        input = hex2str(data["payload"])
        input_json = json.loads(input)

        #check if the image is divided in chunks or it is only one chunk
        #Start check inputs. When we receive a chunk with final tag we turn loaded for true and call opencv. Otherwise we just add the content in the temporary file.
        loaded = False
        img_name = input_json["imageId"]+'.txt'

        with open('temp.txt', "a") as text_file:
            text_file.write(input_json["content"])
        if(input_json["chunk"]=="final"):
            loaded = True
            os.rename('temp.txt', img_name)
            print("You can now load opencv")

        #if loaded = true, convert string64 to img and then calls opencv. At the end, turn loaded = false.
        if(loaded):
            with open(img_name) as f:
                lines = f.read().rstrip()
        #Convert the string to image
            str642img(lines, input_json["imageId"])
        #call opencv binary passing the image has parameter.
            img_name = input_json["imageId"]+'.jpg'
            os.environ['LD_LIBRARY_PATH'] = '/usr/local/opencv-rvv/lib'
            cmd = './lerImagem '+img_name
            so = os.popen(cmd).read()
            print(so)

        logger.info("Adding notice")
        response = requests.post(rollup_server + "/notice", json={"payload": data["payload"]})
        logger.info(f"Received notice status {response.status_code} body {response.content}")

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
        handler = handlers[rollup_request["request_type"]]
        finish["status"] = handler(rollup_request["data"])

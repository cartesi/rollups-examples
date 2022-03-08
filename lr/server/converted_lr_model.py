# Make Predictions with LogisticRegression from Scikit learn + m2gen on the Titanic Dataset

import json
import logging
from os import environ
from random import randrange, seed

import requests
from flask import Flask, request

# Your API definition
app = Flask(__name__)
app.logger.setLevel(logging.INFO)

dispatcher_url = environ["HTTP_DISPATCHER_URL"]
app.logger.info(f"HTTP dispatcher url is {dispatcher_url}")

#generated from m2gen and model.py
def prediction(input):    

    pred = ((((((((-0.08216915223421425) + ((input[0]) * (0.00349192703027234))) + ((input[1]) * (0.4939791267621541))) + ((input[2]) * (-0.45401139771392623))) + ((input[3]) * (-0.36523787286848647))) + ((input[4]) * (0.32047336269862375))) + ((input[5]) * (1.2435677255301452))) + ((input[6]) * (-1.2483645066518427))) + ((input[7]) * (0.0))
    if(pred > 0):
        pred = 1
    else:
        pred = 0
    return pred

def format(json_):
    input_array = []
    for i in range(len(json_)):
        age = json_[i]['Age']
        if(json_[i]['Sex'] == 'female'):
            sex_f = 1
            sex_m = 0
            sex_nan = 0
        else:
            sex_f = 0
            sex_m = 1
            sex_nan = 0
        if(json_[i]['Embarked'] == 'C'):
            embC = 1
            embS = 0
            embQ = 0
            embN = 0
        elif(json_[i]['Embarked'] == 'S'):
            embC = 0
            embS = 1
            embQ = 0
            embN = 0
        else:
            embC = 0
            embS = 0
            embQ = 1
            embN = 0

        input_array.append([age,embC,embQ,embS,embN,sex_f,sex_m,sex_nan])
    
    return input_array


# Cartesi Endpoint
@app.route("/advance", methods=["POST"])
def predict():
    body = request.get_json()
    app.logger.info(f"Received advance request body {body}")
    app.logger.info("Printing Body Payload : " + body["payload"])
    partial = body["payload"][2:]

    content = bytes.fromhex(partial).decode("utf-8")
    app.logger.info("Printing all inputs : " + content)
    json_ = json.loads(content)
    array = format(json_)
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
    app.logger.info("Finishing")
    response = requests.post(dispatcher_url + "/finish", json={"status": "accept"})
    app.logger.info(f"Received finish status {response.status_code}")
    return "", 202



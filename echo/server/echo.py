#!/usr/bin/env python3

from sys import argv
import connexion
import requests

host = argv[1]
port = int(argv[2])
dispatcher_url = argv[3]

def advance():
    body = connexion.request.json
    print(f"Received advance request body {body}")
    print("Adding notice")
    response = requests.post(dispatcher_url+"/notice", json={"payload":body["payload"], "index": 0})
    print(f"Received notice status {response.status_code} body {response.json()}")
    print("Finishing")
    response = requests.post(dispatcher_url+"/finish", json={"status":"accept"})
    print(f"Received finish status {response.status_code}")
    return connexion.NoContent, 202

def inspect(payload):
    print(f"Received inspect request payload {payload}")
    return {"reports": [{"payload": payload}]}, 200

echo = connexion.App(__name__)
echo.add_api('dapp.yaml', resolver=connexion.resolver.RelativeResolver("echo"))

if __name__ == '__main__':
    echo.run(host=host, port=port)

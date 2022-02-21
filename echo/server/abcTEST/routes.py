
from abcTEST import app, db
from flask import redirect, request
import requests
from os import environ
import json

from abcTEST.models import Task, User
from abcTEST.types import Action
dispatcher_url = environ["HTTP_DISPATCHER_URL"]

@app.route("/advance", methods=["POST"])
def advance():
    body = request.get_json()
    partial = body["payload"][2:]
    app.logger.info("Hex Without 0x : " + partial)
    content = (bytes.fromhex(partial).decode("utf-8"))
    s_json = json.loads(content)
    path = s_json["path"]
    method = s_json["method"]
    app.logger.info(f"{content}")
    app.logger.info(f"Dispatcher: {dispatcher_url}")
    app.logger.info(f"Path: {path}")
    # response = requests.post(dispatcher_url + "/notice", json={"payload": body["payload"]})
    # response2 = requests.post("http://0.0.0.0:5003/" + path, json={"payload": body["payload"]})
    users = User.query.all()
    app.logger.info(f"GET na USERS {users}")
    listToStr = ' '.join(map(str, users))
    newpayload = "0x"+str(listToStr.encode("utf-8").hex())
    body["payload"] = newpayload
    app.logger.info(f"GET na USERS {newpayload}")
    response = requests.post(dispatcher_url + "/notice", json={"payload": body["payload"]})
    app.logger.info(f"Received notice status {response.status_code} body {response.content}")
    response = requests.post(dispatcher_url + "/finish", json={"status": "accept"})
    return "List of users", 202

@app.route('/users', methods=['GET', 'POST'])
def users():
    app.logger.info(f"Tu jestem {request}")
    body = request.get_json()
    app.logger.info(f"Tu body:::: {body}")
    partial = body["payload"][2:]
    content = (bytes.fromhex(partial).decode("utf-8"))
    action = json.loads(content)
    app.logger.info(f"Moje action {action}")
    # action = False
    if (action.get('method') == 'POST'):
        name = action.get('payload').get('name');
        email = action.get('payload').get('email');
        user = User(name=name, email=email)
        db.session.add(user)
        db.session.commit()
        response = requests.post(dispatcher_url + "/finish", json={"status": "accept"})
        return "User was added", 202
    else: 
        users = User.query.all()
        app.logger.info(f"GET na USERS {users}")
        response = requests.post(dispatcher_url + "/finish", json={"status": "accept"})
        return "List of users", 202

@app.route('/tasks', methods=['GET', 'POST'])
def tasks():
    action: Action = request.get_json()
    if (action.get('method') == 'POST'):
        title = action.get('payload').get('title');
        description = action.get('payload').get('description');

        task = Task(title=title, description=description)
        db.session.add(task)
        db.session.commit()
        response = requests.post(dispatcher_url + "/finish", json={"status": "accept"})
        return "Task was added", 202
    else: 
        tasks = Task.query.all()
        app.logger.info(f"GET na TASKS {tasks}")
        response = requests.post(dispatcher_url + "/finish", json={"status": "accept"})
        return "List of tasks", 202

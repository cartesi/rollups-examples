import json
import logging
from os import environ

import flask
import requests
from flask import Flask
from flask import request
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.logger.setLevel(logging.INFO)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

dispatcher_url = environ["HTTP_DISPATCHER_URL"]


@app.route("/advance", methods=["POST"])
def advance():
    s_json = hex2json(request.get_json()["payload"])  # make json object from 0x123456... received from request body

    path = s_json["path"]  # recognize HTTP endpoint
    method = s_json["method"]  # recognize HTTP method
    payload = s_json["payload"]  # recognize HTTP payload
    params = s_json.get("params", {})  # recognize HTTP params

    result = {}

    ##################
    # USER ACTIONS
    ##################

    if method == 'GET' and path == '/users':
        result = get_users()

    if method == 'GET' and path == '/users' and params != {}:
        result = get_user(params)

    if method == 'GET' and path == '/users' and params != {}:
        result = get_user(params)

    if method == 'GET' and path == '/users/tasks':
        result = get_user_tasks(params)

    if method == 'PUT' and path == '/users' and params != {}:
        result = update_user(params, payload)

    if method == 'DELETE' and path == '/users' and params != {}:
        result = del_users(params)

    ##################
    # TASK ACTIONS
    ##################

    if method == 'GET' and path == '/tasks':
        result = get_tasks()

    if method == 'GET' and path == '/tasks' and params != {}:
        result = get_task(params)

    if method == 'POST' and path == '/tasks':
        result = add_tasks(payload)

    if method == 'PUT' and path == '/tasks' and params != {}:
        result = update_task(params, payload)

    if method == 'DELETE' and path == '/tasks' and params != {}:
        result = del_task(params)




    if result != {}:
        response = requests.post(dispatcher_url + "/notice", json={"payload": json2hex(result)})
        app.logger.info(f"Received notice status {response.status_code} body {response.content}")

    else:
        app.logger.info(f"Empty result, so skip notice")

    requests.post(dispatcher_url + "/finish", json={"status": "accept"})

    return "Advance OK", 202


def hex2json(hex_json):
    partial = hex_json[2:]  # partial as 123456...
    content = (bytes.fromhex(partial).decode("utf-8"))  # decode partial from hex to string
    return json.loads(content)  # convert decoded partial to json format


def json2hex(json2encode):
    return "0x" + str(flask.json.dumps(json2encode).encode("utf-8").hex())

def get_user(params):
    try:
        user = User.query.filter_by(id=params['id']).first()
        return singleRow2dict(user)
    except Exception as e:
        app.logger.error(f"The user doesn't exists. Exception: {e}")

def get_user_tasks(params):
    try:
        user = User.query.filter_by(id=params['id']).first()
        return rows2dict(user.tasks)
    except Exception as e:
        app.logger.error(f"The user doesn't exists. Exception: {e}")
def update_user(params, payload):
    try:
        user = User.query.filter_by(id=params['id']).first()
        user.name = payload['name']
        user.email = payload['email']
        db.session.commit()
        return singleRow2dict(user)
    except Exception as e:
        app.logger.error(f"The user wasn't updated. Exception: {e}")

def del_users(params):
    try:
        user = User.query.filter_by(id=params['id']).first()
        db.session.delete(user)
        db.session.commit()
        app.logger.info(f"The user deleted successfully. {singleRow2dict(user)}")
    except Exception as e:
        app.logger.error(f"The user wasn't deleted. Exception: {e}")

def get_users():
    try:
        return rows2dict(User.query.all())
    except Exception as e:
        app.logger.error(f"The users don't exist. Exception: {e}")

def add_users(users_payload):
    try:
        user = User(name=users_payload['name'], email=users_payload['email'])
        db.session.add(user)
        db.session.commit()
        return get_users()
    except Exception as e:
        app.logger.error(f"The user wasn't added. Exception: {e}")


#############################################################################

def get_tasks():
    try:
        return rows2dict(Task.query.all())
    except Exception as e:
        app.logger.error(f"The task doesn't exists. Exception: {e}")

def get_task(params):
    try:
        task = Task.query.filter_by(id=params['id']).first()
        return singleRow2dict(task)
    except Exception as e:
        app.logger.error(f"The task doesn't exists. Exception: {e}")

def add_tasks(tasks_payload):
    try:
        task = Task(title=tasks_payload['title'], description=tasks_payload['description'], user_id=tasks_payload['user_id'])
        db.session.add(task)
        db.session.commit()
        return get_tasks()
    except Exception as e:
        app.logger.error(f"The task wasn't added. Exception: {e}")

def update_task(params, payload):
    try:
        task = Task.query.filter_by(id=params['id']).first()
        task.title = payload['title']
        task.description = payload['description']
        db.session.commit()
        return singleRow2dict(task)
    except Exception as e:
        app.logger.error(f"The task wasn't updated. Exception: {e}")

def del_task(params):
    try:
        task = Task.query.filter_by(id=params['id']).first()
        db.session.delete(task)
        db.session.commit()
        app.logger.info(f"The task deleted successfully. {singleRow2dict(task)}")
    except Exception as e:
        app.logger.error(f"The task wasn't deleted. Exception: {e}")


def rows2dict(rows):
    d = []

    for row in rows:
        d.append(singleRow2dict(row))
    return d

def singleRow2dict(row):
    rd = {}
    for column in row.__table__.columns:
        rd[column.name] = str(getattr(row, column.name))
    return rd

class Task(db.Model):
    id = db.Column(db.Integer(), primary_key=True)
    title = db.Column(db.String(length=30), nullable=False)
    description = db.Column(db.String(), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'),
        nullable=False)

    def toJson(self):
        return json.dumps(self, default=lambda o: o.__dict__)


class User(db.Model):
    id = db.Column(db.Integer(), primary_key=True)
    name = db.Column(db.String(length=40), nullable=False)
    email = db.Column(db.String(length=40), nullable=False, unique=True)
    tasks = db.relationship('Task', backref='user', lazy=True)

    def toJson(self):
        return json.dumps(self, default=lambda o: o.__dict__)


if __name__ == '__main__':
    app.run(debug=True)

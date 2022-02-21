from enum import unique
from abcTEST import db


class Task(db.Model):
    id = db.Column(db.Integer(), primary_key=True)
    title = db.Column(db.String(length=30), nullable=False)
    description = db.Column(db.String(), nullable=False)



class User(db.Model):
    id = db.Column(db.Integer(), primary_key=True)
    name = db.Column(db.String(length=40), nullable=False)
    email = db.Column(db.String(length=40), nullable=False, unique=True)

    def __repr__(self):
        return '<User: %r>' % self.name


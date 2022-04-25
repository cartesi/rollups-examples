import sqlite3

with open("./seed.sql", "r") as sql_file:
    sql_script = sql_file.read()

db = sqlite3.connect("order-book.db")
cursor = db.cursor()
cursor.executescript(sql_script)
db.commit()
db.close()

import sqlite3
from .helpers import create_response


def handle_product(sender, payload, logger):
    con = sqlite3.connect("src/db/order-book.db")
    cursor = con.cursor()

    if payload["action"] == "get":
        response = get_products(sender, payload.get("data"), cursor)
    elif payload["action"] == "add":
        response = add_product(sender, payload.get("data"), cursor)
    else:
        response = create_response(False, "unsupported action", None)

    con.commit()

    return response


def get_products(sender, data, cursor):
    data = cursor.execute("SELECT * FROM products").fetchall()

    return create_response(True, "products fetched", data)


def add_product(sender, data, cursor):
    cursor.execute(
        "INSERT OR IGNORE INTO products (name, symbol)\
    VALUES (?, ?)",
        (data["name"], data["symbol"]),
    )

    return create_response(True, "product added", None)

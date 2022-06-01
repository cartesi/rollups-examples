import sqlite3
from .helpers import create_payload, create_response, fetch_product_by_id, fetch_products, insert_product


def handle_product(payload, logger):
    con = sqlite3.connect("src/db/database.db")
    con.row_factory = sqlite3.Row
    cursor = con.cursor()

    if payload["action"] == "get":
        response = get_products(payload.get("data"), cursor)
    elif payload["action"] == "add":
        response = add_product(payload.get("data"), cursor)
    else:
        response = create_response(False, "unsupported action", None)

    con.commit()

    return response


def get_products(data, cursor):
    products = fetch_products(cursor)
    payload = create_payload("products", products)

    return create_response(True, "products fetched", payload)


def add_product(data, cursor):
    insert_product(data["name"], data["symbol"], cursor)
    product_id = cursor.lastrowid
    product = fetch_product_by_id(product_id, cursor)
    payload = create_payload("new_product", product)

    return create_response(True, "product added", payload)

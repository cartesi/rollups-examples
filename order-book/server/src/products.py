import sqlite3
from .helpers import create_payload, create_response, get_product_by_id, query_products, insert_product

def handle_product(sender, payload, logger):
    con = sqlite3.connect("src/db/cartesi-dex.db")
    con.row_factory = sqlite3.Row
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
    products = query_products(cursor)
    payload = create_payload("products", products)

    return create_response(True, "products fetched", payload)


def add_product(sender, data, cursor):
    insert_product(data["name"], data["symbol"], cursor)
    product_id = cursor.lastrowid
    product = get_product_by_id(product_id, cursor)
    payload = create_payload("new_product", product)

    return create_response(True, "product added", payload)

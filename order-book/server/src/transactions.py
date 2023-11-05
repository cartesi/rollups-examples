import sqlite3
from .helpers import create_payload, create_response, fetch_product_id, fetch_highest_traded_price, fetch_last_traded_price, fetch_lowest_traded_price, fetch_transactions_for_product


def handle_transaction(payload, logger):
    con = sqlite3.connect("src/db/database.db")
    con.row_factory = sqlite3.Row
    cursor = con.cursor()

    if payload["action"] == "get":
        response = get_transactions_for_product(payload.get("data"), cursor)
    elif payload["action"] == "get_last_traded":
        response = get_last_traded_price(payload.get("data"), cursor)
    elif payload["action"] == "get_highest_traded":
        response = get_highest_traded_price(payload.get("data"), cursor)
    elif payload["action"] == "get_lowest_traded":
        response = get_lowest_traded_price(payload.get("data"), cursor)
    else:
        response = create_response(False, "unsupported action", None)

    con.commit()

    return response


def get_transactions_for_product(data, cursor):
    product_id = fetch_product_id(data["symbol"], cursor)
    if not product_id:
        return create_response(False, "product not found", None)

    transactions = fetch_transactions_for_product(product_id, cursor)

    payload = create_payload("transactions", transactions)

    return create_response(True, "transactions fetched", payload)


def get_last_traded_price(data, cursor):
    product_id = fetch_product_id(data["symbol"], cursor)
    if not product_id:
        return create_response(False, "product not found", None)

    last_traded = fetch_last_traded_price(product_id, cursor)
    if not last_traded:
        return create_response(False, "no trades yet", None)

    payload = create_payload("last_traded", last_traded)

    return create_response(True, "last traded fetched", payload)


def get_highest_traded_price(data, cursor):
    product_id = fetch_product_id(data["symbol"], cursor)
    if not product_id:
        return create_response(False, "product not found", None)

    highest_traded = fetch_highest_traded_price(product_id, cursor)
    if not highest_traded:
        return create_response(False, "no trades yet", None)

    payload = create_payload("highest_traded", highest_traded)

    return create_response(True, "highest traded fetched", payload)


def get_lowest_traded_price(data, cursor):
    product_id = fetch_product_id(data["symbol"], cursor)
    if not product_id:
        return create_response(False, "product not found", None)

    lowest_traded = fetch_lowest_traded_price(product_id, cursor)
    if not lowest_traded:
        return create_response(False, "no trades yet", None)

    payload = create_payload("lowest_traded", lowest_traded)

    return create_response(True, "lowest traded fetched", payload)

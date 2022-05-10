import sqlite3
from .helpers import create_payload, create_response, get_product_id, query_highest, query_last, query_lowest, query_transactions

def handle_transaction(sender, payload, logger):
    con = sqlite3.connect("src/db/database.db")
    con.row_factory = sqlite3.Row
    cursor = con.cursor()

    if payload["action"] == "get":
        response = get_transactions_for_asset(sender, payload.get("data"), cursor)
    elif payload["action"] == "get_last_traded":
        response = get_last_traded(sender, payload.get("data"), cursor)
    elif payload["action"] == "get_highest_traded":
        response = get_highest_traded(sender, payload.get("data"), cursor)
    elif payload["action"] == "get_lowest_traded":
        response = get_lowest_traded(sender, payload.get("data"), cursor)
    else:
        response = create_response(False, "unsupported action", None)

    con.commit()

    return response

def get_transactions_for_asset(sender, data, cursor):
    product_id = get_product_id(data["symbol"], cursor)
    if not product_id:
        return create_response(False, "product not found", None)

    transactions = query_transactions(product_id, cursor)

    payload = create_payload("transactions", transactions)

    return create_response(True, "transactions fetched", payload)

def get_last_traded(sender, data, cursor):
    product_id = get_product_id(data["symbol"], cursor)
    if not product_id:
        return create_response(False, "product not found", None)

    last_traded = query_last(product_id, cursor)
    if not last_traded:
        return create_response(False, "no trades yet", None)

    payload = create_payload("last_traded", last_traded)

    return create_response(True, "last traded fetched", payload)


def get_highest_traded(sender, data, cursor):
    product_id = get_product_id(data["symbol"], cursor)
    if not product_id:
        return create_response(False, "product not found", None)

    highest_traded = query_highest(product_id, cursor)
    if not highest_traded:
        return create_response(False, "no trades yet", None)

    payload = create_payload("highest_traded", highest_traded)

    return create_response(True, "highest traded fetched", payload)

def get_lowest_traded(sender, data, cursor):
    product_id = get_product_id(data["symbol"], cursor)
    if not product_id:
        return create_response(False, "product not found", None)

    lowest_traded = query_lowest(product_id, cursor)
    if not lowest_traded:
        return create_response(False, "no trades yet", None)

    payload = create_payload("lowest_traded", lowest_traded)

    return create_response(True, "lowest traded fetched", payload)

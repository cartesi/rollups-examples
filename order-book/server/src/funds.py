import sqlite3
from .helpers import create_response, fetch_available_user_funds, fetch_fund_by_id, fetch_user_funds, fetch_address_id, fetch_product_id, insert_funds, create_payload


def handle_fund(payload, logger):
    con = sqlite3.connect("src/db/database.db")
    con.row_factory = sqlite3.Row
    cursor = con.cursor()

    if payload["action"] == "get":
        response = get_all_funds(payload.get("data"), cursor)
    elif payload["action"] == "get_available":
        response = get_available_funds(payload.get("data"), cursor)
    elif payload["action"] == "add":
        response = add_funds(payload.get("data"), cursor)
    else:
        response = create_response(False, "unsupported action", None)

    con.commit()

    return response


def get_all_funds(data, cursor):
    address_id = fetch_address_id(data["sender"], cursor)
    if address_id == None:
        return create_response(False, "account not found", None)

    funds = fetch_user_funds(address_id, cursor)
    payload = create_payload("user_funds", funds)

    return create_response(True, "user funds fetched", payload)


def get_available_funds(data, cursor):
    address_id = fetch_address_id(data["sender"], cursor)
    if not address_id:
        return create_response(False, "account not found", None)

    funds = fetch_available_user_funds(address_id, cursor)
    payload = create_payload("available_user_funds", funds)

    return create_response(True, "available user funds fetched", payload)


def add_funds(data, cursor):
    address_id = fetch_address_id(data["sender"], cursor)
    if not address_id:
        return create_response(False, "account not found", None)

    product_id = fetch_product_id(data["symbol"], cursor)
    if not product_id:
        return create_response(False, "product not found", None)

    insert_funds(address_id, product_id, data["amount"], 0, cursor)

    fund_id = cursor.lastrowid
    fund = fetch_fund_by_id(fund_id, cursor)
    payload = create_payload("new_funds", fund)

    return create_response(True, "funds added", payload)

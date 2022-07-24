import sqlite3
from .helpers import create_payload, create_response, fetch_accounts, fetch_account_by_id, fetch_address_id, insert_address


def handle_account(payload, logger):
    con = sqlite3.connect("src/db/database.db")
    con.row_factory = sqlite3.Row
    cursor = con.cursor()

    if payload["action"] == "get":
        response = get_accounts(payload.get("data"), cursor)
    elif payload["action"] == "add":
        response = add_account(payload.get("data"), cursor)
    else:
        response = create_response(False, "unsupported action", None)

    con.commit()

    return response


def get_accounts(data, cursor):
    accounts = fetch_accounts(cursor)
    payload = create_payload("accounts", accounts)

    return create_response(True, "accounts fetched", payload)


def add_account(data, cursor):
    address_id = fetch_address_id(data["sender"], cursor)
    if address_id:
        return create_response(False, "account already added", None)

    insert_address(data["sender"], cursor)

    address_id = fetch_address_id(data["sender"], cursor)
    account = fetch_account_by_id(address_id, cursor)
    payload = create_payload("new_account", account)

    return create_response(True, "account added", payload)

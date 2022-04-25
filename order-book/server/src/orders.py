import sqlite3
from .helpers import create_response, get_address_id, get_product_id

def handle_order(sender, payload, logger):
    con = sqlite3.connect("src/db/order-book.db")
    cursor = con.cursor()

    if payload["action"] == "get":
        response = get_orders_for_user(sender, payload.get("data"), cursor)
    elif payload["action"] == "create":
        response = create_order(sender, payload.get("data"), cursor)
    elif payload["action"] == "delete":
        response = delete_order(sender, payload.get("data"), cursor)
    elif payload["action"] == "get_book":
        response = get_book_for_asset(sender, payload.get("data"), cursor)
    elif payload["action"] == "get_bids":
        response = get_bids_for_asset(sender, payload.get("data"), cursor)
    elif payload["action"] == "get_offers":
        response = get_offers_for_asset(sender, payload.get("data"), cursor)
    elif payload["action"] == "get_bid":
        response = get_highest_bid(sender, payload.get("data"), cursor)
    elif payload["action"] == "get_offer":
        response = get_lowest_offer(sender, payload.get("data"), cursor)
    elif payload["action"] == "get_spread":
        response = get_bid_offer_spread(sender, payload.get("data"), cursor)
    elif payload["action"] == "get_market":
        response = get_market(sender, payload.get("data"), cursor)
    else:
        response = create_response(False, "unsupported action", None)

    con.commit()

    return response


def get_book_for_asset(sender, data, cursor):
    product_id = get_product_id(data["symbol"], cursor)
    if not product_id:
        return create_response(False, "product not found", None)

    data = cursor.execute(
        "SELECT * FROM orders WHERE product_id = ?",
        (product_id,),
    ).fetchall()

    return create_response(True, "book for product fetched", data)


def get_bids_for_asset(sender, data, cursor):
    product_id = get_product_id(data["symbol"], cursor)
    if not product_id:
        return create_response(False, "product not found", None)

    data = cursor.execute(
        "SELECT * FROM orders WHERE product_id = ? AND amount > 0",
        (product_id,),
    ).fetchall()

    return create_response(True, "bids for product fetched", data)


def get_offers_for_asset(sender, data, cursor):
    product_id = get_product_id(data["symbol"], cursor)
    if not product_id:
        return create_response(False, "product not found", None)

    data = cursor.execute(
        "SELECT * FROM orders WHERE product_id = ? AND 0 > amount",
        (product_id,),
    ).fetchall()

    return create_response(True, "offers for product fetched", data)


def get_orders_for_user(sender, data, cursor):
    cursor.execute("INSERT OR IGNORE INTO accounts (address) VALUES (?)", (sender,))

    address_id = get_address_id(sender, cursor)
    if not address_id:
        return create_response(False, "account not found", None)

    data = cursor.execute(
        "SELECT * FROM orders WHERE address_id = ?",
        (address_id,),
    ).fetchall()

    return create_response(True, "orders of user fetched", data)


def create_order(sender, data, cursor):
    cursor.execute("INSERT OR IGNORE INTO accounts (address) VALUES (?)", (sender,))

    address_id = get_address_id(sender, cursor)
    if not address_id:
        return create_response(False, "account not found", None)

    product_id = get_product_id(data["symbol"], cursor)
    if not product_id:
        return create_response(False, "product not found", None)

    cursor.execute(
        "INSERT INTO orders (address_id, unit_price, amount, product_id, closing_time, timestamp)\
         VALUES (?, ?, ?, ?, ?, ?)",
        (
            address_id,
            data["unit_price"],
            data["amount"],
            product_id,
            data["closing_time"],
            data["timestamp"],
        ),
    )

    return create_response(True, "order created", None)


def delete_order(sender, data, cursor):
    address_id = get_address_id(sender, cursor)
    if not address_id:
        return create_response(False, "account not found", None)

    cursor.execute(
        "DELETE FROM orders WHERE id = ? AND address_id = ?",
        (data["id"], address_id),
    )

    return create_response(True, "order deleted", None)


def get_highest_bid(sender, data, cursor):
    product_id = get_product_id(data["symbol"], cursor)
    if not product_id:
        return create_response(False, "product not found", None)

    highest_bid = cursor.execute(
        "SELECT MAX (unit_price) FROM orders WHERE product_id = ? AND amount > 0",
        (product_id,),
    ).fetchone()[0]

    if not highest_bid:
        return create_response(False, "no bids found", None)

    return create_response(True, "highest bid for product fetched", highest_bid)


def get_lowest_offer(sender, data, cursor):
    product_id = get_product_id(data["symbol"], cursor)
    if not product_id:
        return create_response(False, "product not found", None)

    lowest_offer = cursor.execute(
        "SELECT MIN (unit_price) FROM orders WHERE product_id = ? AND 0 > amount",
        (product_id,),
    ).fetchone()[0]

    if not lowest_offer:
        return create_response(False, "no offers found", None)

    return create_response(True, "lowest offer for product fetched", lowest_offer)


def get_bid_offer_spread(sender, data, cursor):
    product_id = get_product_id(data["symbol"], cursor)
    if not product_id:
        return create_response(False, "product not found", None)

    highest_bid = cursor.execute(
        "SELECT MAX (unit_price) FROM orders WHERE product_id = ? AND amount > 0",
        (product_id,),
    ).fetchone()[0]

    lowest_offer = cursor.execute(
        "SELECT MIN (unit_price) FROM orders WHERE product_id = ? AND 0 > amount",
        (product_id,),
    ).fetchone()[0]

    if None in (highest_bid, lowest_offer):
        return create_response(False, "no bids or offers found", None)

    bid_offer_spread = lowest_offer - highest_bid

    return create_response(True, "bid-offer spread for product fetched", bid_offer_spread)


def get_market(sender, data, cursor):
    product_id = get_product_id(data["symbol"], cursor)
    if not product_id:
        return create_response(False, "product not found", None)

    highest_bid = cursor.execute(
        "SELECT MAX (unit_price) FROM orders WHERE product_id = ? AND amount > 0",
        (product_id,),
    ).fetchone()[0]

    lowest_offer = cursor.execute(
        "SELECT MIN (unit_price) FROM orders WHERE product_id = ? AND 0 > amount",
        (product_id,),
    ).fetchone()[0]

    if None in (highest_bid, lowest_offer):
        return create_response(False, "no bids or offers found", None)

    bids_at_highest = cursor.execute(
        "SELECT SUM (amount) FROM orders WHERE unit_price = ? AND amount > 0",
        (highest_bid,),
    ).fetchone()[0]

    offers_at_lowest = cursor.execute(
        "SELECT SUM (amount) FROM orders WHERE unit_price = ? AND 0 > amount",
        (lowest_offer,),
    ).fetchone()[0] * (-1)

    bid_offer_spread = lowest_offer - highest_bid

    mid_price = (lowest_offer + highest_bid) / 2

    data = {
        "highest_bid": highest_bid,
        "bids_at_highest": bids_at_highest,
        "lowest_offer": lowest_offer,
        "offers_at_lowest": offers_at_lowest,
        "bid_offer_spread": bid_offer_spread,
        "mid_price": mid_price,
    }

    return create_response(True, "market data for product fetched", data)

from math import prod
import sqlite3
from .helpers import create_payload, create_response, get_address_id, get_best_market_price, get_order_by_id, get_product_id, get_user_orders, insert_address, insert_order, modify_order, query_best_price_amount, query_book, query_orders, query_side, cancel_order
from .matcher import find_matches

def handle_order(sender, payload, logger):
    con = sqlite3.connect("src/db/database.db")
    con.row_factory = sqlite3.Row
    cursor = con.cursor()

    if payload["action"] == "get":
        response = get_orders_for_user(sender, payload.get("data"), cursor)
    elif payload["action"] == "create":
        response = create_order(sender, payload.get("data"), cursor)
    elif payload["action"] == "update":
        response = update_order(sender, payload.get("data"), cursor)
    elif payload["action"] == "delete":
        response = delete_order(sender, payload.get("data"), cursor)
    elif payload["action"] == "get_book":
        response = get_book_for_asset(sender, payload.get("data"), cursor)
    elif payload["action"] == "get_orders":
        response = get_orders_for_asset(sender, payload.get("data"), cursor)
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

    book = query_book(product_id, cursor)

    payload = create_payload("open_orders_for_asset", book)

    return create_response(True, "book for product fetched", payload)

def get_orders_for_asset(sender, data, cursor):
    product_id = get_product_id(data["symbol"], cursor)
    if not product_id:
        return create_response(False, "product not found", None)

    orders = query_orders(product_id, cursor)

    payload = create_payload("all_orders_for_asset", orders)
    

    return create_response(True, "all orders for product fetched", payload)


def get_bids_for_asset(sender, data, cursor):
    product_id = get_product_id(data["symbol"], cursor)
    if not product_id:
        return create_response(False, "product not found", None)

    bids = query_side(product_id, "bid", cursor)

    payload = create_payload("bids_for_asset", bids)

    return create_response(True, "bids for product fetched", payload)


def get_offers_for_asset(sender, data, cursor):
    product_id = get_product_id(data["symbol"], cursor)
    if not product_id:
        return create_response(False, "product not found", None)

    offers = query_side(product_id, "offer", cursor)

    payload = create_payload("offers_for_asset", offers)

    return create_response(True, "offers for product fetched", payload)


def get_orders_for_user(sender, data, cursor):
    address_id = get_address_id(sender, cursor)
    if not address_id:
        return create_response(False, "account not found", None)

    user_orders = get_user_orders(address_id, cursor)

    payload = create_payload("orders_for_user", user_orders)

    return create_response(True, "orders of user fetched", payload)


def create_order(sender, data, cursor):
    insert_address(sender, cursor)
    address_id = get_address_id(sender, cursor)
    if not address_id:
        return create_response(False, "account not found", None)

    product_id = get_product_id(data["symbol"], cursor)
    if not product_id:
        return create_response(False, "product not found", None)

    insert_order(data, address_id, product_id, cursor)
    order_id = cursor.lastrowid
    payload = find_matches(order_id, cursor)

    return create_response(True, "order created", payload)

def update_order(sender, data, cursor):
    address_id = get_address_id(sender, cursor)
    if not address_id:
        return create_response(False, "account not found", None)

    order = get_order_by_id(data["id"], cursor)
    if address_id != order["address_id"]:
        return create_response(False, "not authorized", None)

    modify_order(data, cursor)

    payload = find_matches(data["id"], cursor)

    return create_response(True, "order updated", payload)


def delete_order(sender, data, cursor):
    address_id = get_address_id(sender, cursor)
    if not address_id:
        return create_response(False, "account not found", None)

    order = get_order_by_id(data["id"], cursor)

    if address_id != order["address_id"]:
        return create_response(False, "not authorized", None)

    cancel_order(data["id"], cursor)

    payload = create_payload("deleted_order", order)

    return create_response(True, "order deleted", payload)


def get_highest_bid(sender, data, cursor):
    product_id = get_product_id(data["symbol"], cursor)
    if not product_id:
        return create_response(False, "product not found", None)

    highest_bid = get_best_market_price("bid", product_id, 0, cursor) # timestamp = 0 for now

    if not highest_bid:
        return create_response(False, "no bids found", None)

    payload = create_payload("highest_bid", highest_bid)

    return create_response(True, "highest bid for product fetched", payload)


def get_lowest_offer(sender, data, cursor):
    product_id = get_product_id(data["symbol"], cursor)
    if not product_id:
        return create_response(False, "product not found", None)

    lowest_offer = get_best_market_price("offer", product_id, 0, cursor) # timestamp = 0 for now

    if not lowest_offer:
        return create_response(False, "no offers found", None)

    payload = create_payload("lowest_offer", lowest_offer)

    return create_response(True, "lowest offer for product fetched", payload)


def get_bid_offer_spread(sender, data, cursor):
    product_id = get_product_id(data["symbol"], cursor)
    if not product_id:
        return create_response(False, "product not found", None)

    highest_bid = get_best_market_price("bid", product_id, 0, cursor) # timestamp = 0 for now
    lowest_offer = get_best_market_price("offer", product_id, 0, cursor) # timestamp = 0 for now

    if None in (highest_bid, lowest_offer):
        return create_response(False, "no bids or offers found", None)

    bid_offer_spread = lowest_offer - highest_bid

    payload = create_payload("bid_offer_spread", bid_offer_spread)

    return create_response(True, "bid-offer spread for product fetched", payload)


def get_market(sender, data, cursor):
    product_id = get_product_id(data["symbol"], cursor)
    if not product_id:
        return create_response(False, "product not found", None)

    highest_bid = get_best_market_price("bid", product_id, 0, cursor) # timestamp = 0 for now
    lowest_offer = get_best_market_price("offer", product_id, 0, cursor) # timestamp = 0 for now


    if None in (highest_bid, lowest_offer):
        return create_response(False, "no bids or offers found", None)

    bids_at_highest = query_best_price_amount("bid", product_id, highest_bid, 0, cursor) # timestamp = 0 for now
    offers_at_lowest = query_best_price_amount("offer", product_id, lowest_offer, 0, cursor) # timestamp = 0 for now

    bid_offer_spread = lowest_offer - highest_bid

    mid_price = (lowest_offer + highest_bid) / 2

    market_data = {
        "highest_bid": highest_bid,
        "bids_at_highest": bids_at_highest,
        "lowest_offer": lowest_offer,
        "offers_at_lowest": offers_at_lowest,
        "bid_offer_spread": bid_offer_spread,
        "mid_price": mid_price,
    }

    payload = create_payload("market_data", market_data)

    return create_response(True, "market data for product fetched", payload)

from audioop import add
from math import prod
import sqlite3
from .helpers import create_payload, create_response, fetch_address_id, fetch_best_market_price, fetch_best_price_with_amount, fetch_fund_for_product, fetch_order_by_id, fetch_product_by_id, fetch_product_id, fetch_user_orders, has_enough_funds, insert_address, insert_funds, insert_order, fetch_best_price_amount, fetch_book, fetch_orders, fetch_side, delete_order, update_order
from .matcher import find_market_matches, find_matches


def handle_order(payload, logger):
    con = sqlite3.connect("src/db/database.db")
    con.row_factory = sqlite3.Row
    cursor = con.cursor()

    if payload["action"] == "get":
        response = get_orders_for_user(payload.get("data"), cursor)
    elif payload["action"] == "create":
        response = create_order(payload.get("data"), cursor)
    elif payload["action"] == "modify":
        response = modify_order(payload.get("data"), cursor)
    elif payload["action"] == "cancel":
        response = cancel_order(payload.get("data"), cursor)
    elif payload["action"] == "get_book":
        response = get_book_for_asset(payload.get("data"), cursor)
    elif payload["action"] == "get_orders":
        response = get_orders_for_asset(payload.get("data"), cursor)
    elif payload["action"] == "get_bids":
        response = get_bids_for_asset(payload.get("data"), cursor)
    elif payload["action"] == "get_offers":
        response = get_offers_for_asset(payload.get("data"), cursor)
    elif payload["action"] == "get_bid":
        response = get_highest_bid(payload.get("data"), cursor)
    elif payload["action"] == "get_offer":
        response = get_lowest_offer(payload.get("data"), cursor)
    elif payload["action"] == "get_best":
        response = get_best_price(payload.get("data"), cursor)
    elif payload["action"] == "get_spread":
        response = get_bid_offer_spread(payload.get("data"), cursor)
    elif payload["action"] == "get_market":
        response = get_market(payload.get("data"), cursor)
    else:
        response = create_response(False, "unsupported action", None)

    con.commit()

    return response


def get_book_for_asset(data, cursor):
    product_id = fetch_product_id(data["symbol"], cursor)
    if not product_id:
        return create_response(False, "product not found", None)

    book = fetch_book(product_id, cursor)

    payload = create_payload("open_orders_for_asset", book)

    return create_response(True, "book for product fetched", payload)


def get_orders_for_asset(data, cursor):
    product_id = fetch_product_id(data["symbol"], cursor)
    if not product_id:
        return create_response(False, "product not found", None)

    orders = fetch_orders(product_id, cursor)

    payload = create_payload("all_orders_for_asset", orders)

    return create_response(True, "all orders for product fetched", payload)


def get_bids_for_asset(data, cursor):
    product_id = fetch_product_id(data["symbol"], cursor)
    if not product_id:
        return create_response(False, "product not found", None)

    bids = fetch_side(product_id, "bid", cursor)

    payload = create_payload("bids_for_asset", bids)

    return create_response(True, "bids for product fetched", payload)


def get_offers_for_asset(data, cursor):
    product_id = fetch_product_id(data["symbol"], cursor)
    if not product_id:
        return create_response(False, "product not found", None)

    offers = fetch_side(product_id, "offer", cursor)

    payload = create_payload("offers_for_asset", offers)

    return create_response(True, "offers for product fetched", payload)


def get_orders_for_user(data, cursor):
    address_id = fetch_address_id(data["sender"], cursor)
    if address_id == None:
        return create_response(False, "account not found", None)

    user_orders = fetch_user_orders(address_id, cursor)

    payload = create_payload("orders_for_user", user_orders)

    return create_response(True, "orders of user fetched", payload)


def create_order(data, cursor):
    address_id = fetch_address_id(data["sender"], cursor)
    if not address_id:
        return create_response(False, "account not found", None)

    product_id = fetch_product_id(data["symbol"], cursor)
    if not product_id:
        return create_response(False, "product not found", None)

    base_product_id = fetch_product_id("CTSI", cursor)

    # limit orders, reserve funds
    if data["type"] == "limit":
        if not has_enough_funds(data, address_id, product_id, cursor):
            return create_response(False, "not enough funds", None)

        if data["side"] == "bid":
            amount_to_reserve = data["unit_price"] * data["amount"] * -1
            insert_funds(address_id, base_product_id,
                         amount_to_reserve, 1, cursor)
        if data["side"] == "offer":
            amount_to_reserve = data["amount"] * -1
            insert_funds(address_id, product_id, amount_to_reserve, 1, cursor)

    insert_order(data, address_id, product_id, cursor)
    order_id = cursor.lastrowid
    if data["type"] == "market":
        payload = find_market_matches(order_id, address_id, cursor)
    elif data["type"] == "limit":
        payload = find_matches(order_id, cursor)
    return create_response(True, "order created", payload)


def modify_order(data, cursor):
    address_id = fetch_address_id(data["sender"], cursor)
    if not address_id:
        return create_response(False, "account not found", None)

    order = fetch_order_by_id(data["id"], cursor)
    if not order:
        return create_response(False, "order not found", None)
    if address_id != order["address_id"]:
        return create_response(False, "not authorized", None)

    print(order)
    address_id = order["address_id"]
    product_id = order["product_id"]
    original_price = order["unit_price"]
    original_amount = order["amount"]
    modified_price = data["unit_price"]
    modified_amount = data["amount"]
    data["side"] = order["side"]
    data["type"] = order["type"]
    side = order["side"]
    type = order["type"]
    base_product_id = fetch_product_id("CTSI", cursor)

    # With bids the value is unit_price * amount and check CTSI
    if side == "bid":
        original_value = original_amount * original_price
        modified_value = modified_amount * modified_price
        amount_to_reserve_or_lift = original_value - modified_value
        available_user_funds = fetch_fund_for_product(
            address_id, base_product_id, cursor)
        if available_user_funds + original_value <= modified_value:
            return create_response(False, "not enough funds", None)
        insert_funds(address_id, base_product_id,
                     amount_to_reserve_or_lift, 1, cursor)
    # With offers the value is amount and check product
    elif side == "offer":
        amount_to_reserve_or_lift = original_amount - modified_amount
        available_user_funds = fetch_fund_for_product(
            address_id, product_id, cursor)
        if available_user_funds + original_amount <= modified_amount:
            return create_response(False, "not enough funds", None)
        insert_funds(address_id, product_id,
                     amount_to_reserve_or_lift, 1, cursor)

    update_order(data, cursor)
    order_id = order["id"]
    payload = find_matches(order_id, cursor)

    return create_response(True, "order updated", payload)


def cancel_order(data, cursor):
    address_id = fetch_address_id(data["sender"], cursor)
    if not address_id:
        return create_response(False, "account not found", None)

    order = fetch_order_by_id(data["id"], cursor)
    if not order:
        return create_response(False, "order not found", None)
    if address_id != order["address_id"]:
        return create_response(False, "not authorized", None)

    base_product_id = fetch_product_id("CTSI", cursor)

    if order["side"] == "bid":
        amount_to_lift = order["unit_price"] * order["amount"]
        insert_funds(address_id, base_product_id,
                     amount_to_lift, 1, cursor)
    elif order["side"] == "offer":
        amount_to_lift = order["amount"]
        insert_funds(address_id, order["product_id"],
                     amount_to_lift, 1, cursor)

    delete_order(data["id"], cursor)

    payload = create_payload("deleted_order", order)

    return create_response(True, "order deleted", payload)


def get_highest_bid(data, cursor):
    product_id = fetch_product_id(data["symbol"], cursor)
    if not product_id:
        return create_response(False, "product not found", None)

    highest_bid = fetch_best_market_price(
        "bid", product_id, 0, cursor)  # timestamp = 0 for now

    if not highest_bid:
        return create_response(False, "no bids found", None)

    payload = create_payload("highest_bid", highest_bid)

    return create_response(True, "highest bid for product fetched", payload)


def get_lowest_offer(data, cursor):
    product_id = fetch_product_id(data["symbol"], cursor)
    if not product_id:
        return create_response(False, "product not found", None)

    lowest_offer = fetch_best_market_price(
        "offer", product_id, 0, cursor)  # timestamp = 0 for now

    if not lowest_offer:
        return create_response(False, "no offers found", None)

    payload = create_payload("lowest_offer", lowest_offer)

    return create_response(True, "lowest offer for product fetched", payload)


def get_best_price(data, cursor):
    product_id = fetch_product_id(data["symbol"], cursor)
    if not product_id:
        return create_response(False, "product not found", None)

    side = data["side"]
    best_price = fetch_best_market_price(
        side, product_id, 0, cursor)  # timestamp = 0 for now

    if not best_price:
        return create_response(False, "no price found", None)

    payload = create_payload("best_price", best_price)

    return create_response(True, "best price for product fetched", payload)


def get_bid_offer_spread(data, cursor):
    product_id = fetch_product_id(data["symbol"], cursor)
    if not product_id:
        return create_response(False, "product not found", None)

    highest_bid = fetch_best_market_price(
        "bid", product_id, 0, cursor)  # timestamp = 0 for now
    lowest_offer = fetch_best_market_price(
        "offer", product_id, 0, cursor)  # timestamp = 0 for now

    if None in (highest_bid, lowest_offer):
        return create_response(False, "no bids or offers found", None)

    bid_offer_spread = lowest_offer - highest_bid

    payload = create_payload("bid_offer_spread", bid_offer_spread)

    return create_response(True, "bid-offer spread for product fetched", payload)


def get_market(data, cursor):
    product_id = fetch_product_id(data["symbol"], cursor)
    if not product_id:
        return create_response(False, "product not found", None)

    highest_bid_with_amount = fetch_best_price_with_amount(
        "bid", product_id, 0, cursor)
    lowest_offer_with_amount = fetch_best_price_with_amount(
        "offer", product_id, 0, cursor)

    if None in (highest_bid_with_amount, lowest_offer_with_amount):
        return create_response(False, "no bids or offers found", None)

    highest_bid, bids_at_highest = highest_bid_with_amount.values()
    lowest_offer, offers_at_lowest = lowest_offer_with_amount.values()

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

from .helpers import fetch_address_id_by_order_id, fetch_fund_for_product, fetch_order_by_id, fetch_product_id, insert_funds, matching_price_exists, calculate_amount_to_transact, fetch_transaction_by_id, update_order_amount, insert_transaction, fetch_best_market_price, fetch_counter_order


def find_matches(order_id, cursor):
    order = fetch_order_by_id(order_id, cursor)
    order_type = order["type"]
    order_side = order["side"]
    order_price = order["unit_price"]
    order_amount = order["amount"]
    product_id = order["product_id"]
    order_timestamp = order["timestamp"]

    transactions_made = []

    if order_side == "bid":
        counter_order_side = "offer"
    elif order_side == "offer":
        counter_order_side = "bid"

    while order_amount != 0:
        best_market_price = fetch_best_market_price(
            counter_order_side, product_id, order_timestamp, cursor)
        if not best_market_price or not matching_price_exists(order_type, order_side, order_price, best_market_price):
            break

        counter_order = fetch_counter_order(
            counter_order_side, best_market_price, product_id, cursor)
        counter_order_id = counter_order["id"]
        counter_order_amount = counter_order["amount"]

        amount_to_transact = calculate_amount_to_transact(
            [order_amount, counter_order_amount])

        order_amount -= amount_to_transact
        update_order_amount(order_amount, order_id, cursor)
        counter_order_amount -= amount_to_transact
        update_order_amount(counter_order_amount, counter_order_id, cursor)

        insert_transaction(order_side, order_id, counter_order_id, product_id,
                           best_market_price, amount_to_transact, order_timestamp, cursor)
        transaction_id = cursor.lastrowid
        transaction = fetch_transaction_by_id(transaction_id, cursor)
        transactions_made.append(transaction)

        update_funds(transaction, cursor)

    return ({"order": order, "transactions_made": transactions_made})


def find_market_matches(order_id, address_id, cursor):
    order = fetch_order_by_id(order_id, cursor)
    order_type = order["type"]
    order_side = order["side"]
    order_amount = order["amount"]
    product_id = order["product_id"]
    order_timestamp = order["timestamp"]

    base_product_id = fetch_product_id("CTSI", cursor)

    transactions_made = []

    if order_side == "bid":
        counter_order_side = "offer"
    elif order_side == "offer":
        counter_order_side = "bid"

    while order_amount != 0:
        if order_side == "bid":
            available_funds = fetch_fund_for_product(
                address_id, base_product_id, cursor)
        elif order_side == "offer":
            available_funds = fetch_fund_for_product(
                address_id, product_id, cursor)

        best_market_price = fetch_best_market_price(
            counter_order_side, product_id, order_timestamp, cursor)
        if not best_market_price or not matching_price_exists(order_type, order_side, available_funds, best_market_price):
            update_order_amount(0, order_id, cursor)
            break

        counter_order = fetch_counter_order(
            counter_order_side, best_market_price, product_id, cursor)
        counter_order_id = counter_order["id"]
        counter_order_amount = counter_order["amount"]

        if order_side == "bid":
            affordable_amount = int(available_funds / best_market_price)
        elif order_side == "offer":
            affordable_amount = int(available_funds)

        amount_to_transact = calculate_amount_to_transact(
            [order_amount, counter_order_amount, affordable_amount])

        order_amount -= amount_to_transact
        update_order_amount(order_amount, order_id, cursor)
        counter_order_amount -= amount_to_transact
        update_order_amount(counter_order_amount, counter_order_id, cursor)

        insert_transaction(order_side, order_id, counter_order_id, product_id,
                           best_market_price, amount_to_transact, order_timestamp, cursor)
        transaction_id = cursor.lastrowid
        transaction = fetch_transaction_by_id(transaction_id, cursor)
        transactions_made.append(transaction)

        update_funds(transaction, cursor)

        if order_side == "bid":
            available_funds -= amount_to_transact * best_market_price
        elif order_side == "offer":
            available_funds -= amount_to_transact

    return ({"order": order, "transactions_made": transactions_made})


def update_funds(transaction, cursor):
    buy_order_id = transaction['buy_order_id']
    buy_order_type = fetch_order_by_id(buy_order_id, cursor)["type"]
    sell_order_id = transaction['sell_order_id']
    sell_order_type = fetch_order_by_id(sell_order_id, cursor)["type"]

    product_id = transaction['product_id']
    unit_price = transaction['unit_price']
    amount = transaction['amount']
    negative_amount = amount * -1
    transaction_value = amount * unit_price
    negative_transaction_value = transaction_value * -1

    base_product_id = fetch_product_id("CTSI", cursor)

    # BUYER
    buyer_address_id = fetch_address_id_by_order_id(
        buy_order_id, cursor)
    # lift reserved fund for buyer if buyer was the limit bid
    if buy_order_type == "limit":
        insert_funds(buyer_address_id, base_product_id,
                     transaction_value, 1, cursor)
    # add new PLUS fund to buyer what they bought
    insert_funds(buyer_address_id, product_id,
                 amount, 0, cursor)
    # add new MINUS fund to buyer what they sold
    insert_funds(buyer_address_id, base_product_id,
                 negative_transaction_value, 0, cursor)

    # SELLER
    seller_address_id = fetch_address_id_by_order_id(
        sell_order_id, cursor)
    # lift reserved fund for seller if seller was the limit offer
    if sell_order_type == "limit":
        insert_funds(seller_address_id, product_id,
                     amount, 1, cursor)
    # add new PLUS fund to seller what they sold for
    insert_funds(seller_address_id, base_product_id,
                 transaction_value, 0, cursor)
    # add new MINUS fund to seller what they sold
    insert_funds(seller_address_id, product_id,
                 negative_amount, 0, cursor)

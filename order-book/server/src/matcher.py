from .helpers import get_order_by_id, matching_price_exists, get_amount_to_transact, get_transaction_by_id, update_order_amount, create_transaction, get_best_market_price, get_counter_order

def find_matches(order_id, cursor):
    order = get_order_by_id(order_id, cursor)
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
        best_market_price = get_best_market_price(counter_order_side, product_id, order_timestamp, cursor)
        if not matching_price_exists(order_side, order_price, best_market_price):
            break

        counter_order = get_counter_order(counter_order_side, best_market_price, product_id, cursor)

        counter_order_id = counter_order["id"]
        counter_order_amount = counter_order["amount"]

        amount_to_transact = get_amount_to_transact(order_amount, counter_order_amount)
        
        create_transaction(order_id, counter_order_id, product_id, best_market_price, amount_to_transact, order_timestamp, cursor)

        order_amount -= amount_to_transact
        update_order_amount(order_amount, order_id, cursor)
        counter_order_amount -= amount_to_transact
        update_order_amount(counter_order_amount, counter_order_id, cursor)

        transaction_id = cursor.lastrowid
        transaction = get_transaction_by_id(transaction_id, cursor)
        transactions_made.append(transaction)

    return ({"order": order, "transactions_made": transactions_made})

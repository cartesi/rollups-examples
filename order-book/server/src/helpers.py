from itertools import product


def create_response(success, message, data):
    response =  { 
                    "status": {
                        "success": success,
                        "message": message
                    }
                }
    if data:
        response["data"] = data

    return response

def create_payload(k, v):
    return ({k: v})

def parse_row(row):
    return dict(row)

def parse_rows(rows):
    row_list = []
    for row in rows:
        row_list.append(dict(row))
    return row_list

def get_product_id(symbol, cursor):
    try:
        row = cursor.execute(
            "SELECT id FROM products WHERE symbol = ?", (symbol,)
        ).fetchone()
    except:
        return None

    product_id = parse_row(row)["id"]

    return product_id


def get_address_id(sender, cursor):
    try:
        row = cursor.execute(
            "SELECT id FROM accounts WHERE address = ?", (sender,)
        ).fetchone()
    except:
        return None

    address_id = parse_row(row)["id"]

    return address_id

def get_product_by_id(id, cursor):
    row = cursor.execute(
        "SELECT * FROM products WHERE id = ?",
        (id,)
    ).fetchone()

    product = parse_row(row)

    return product

def get_order_by_id(id, cursor):
    row = cursor.execute(
        "SELECT * FROM orders WHERE id = ?",
        (id,),
        ).fetchone()

    order = parse_row(row)

    return order

def get_transaction_by_id(id, cursor):
    row = cursor.execute(
                    "SELECT * FROM transactions WHERE id = ?",
                    (id,)
        ).fetchone()

    transaction = parse_row(row)

    return transaction

def update_order_amount(amount, id, cursor):
    cursor.execute(
        "UPDATE orders SET amount = ? WHERE id = ?",
        (amount, id)
    )

def create_transaction(buy_order_id, sell_order_id, product_id, unit_price, amount, timestamp, cursor):
    cursor.execute(
        "INSERT INTO transactions (buy_order_id, sell_order_id, product_id, unit_price, amount, timestamp)\
        VALUES (?, ?, ?, ?, ?, ?)",
        (
            buy_order_id,
            sell_order_id,
            product_id,
            unit_price,
            amount,
            timestamp,
        ),
    )

def get_best_market_price(side, id, timestamp, cursor):
    if side != "bid":
        row = cursor.execute(
            "SELECT MIN (unit_price) FROM orders WHERE 0 < amount AND side = ? AND product_id = ? AND ? < closing_time",
            (side, id, timestamp),
        ).fetchone()

        best_market_price = parse_row(row)["MIN (unit_price)"]

    elif side != "offer":
        row = cursor.execute(
            "SELECT MAX (unit_price) FROM orders WHERE 0 < amount AND side = ? AND product_id = ? AND ? < closing_time",
            (side, id, timestamp),
        ).fetchone()

        best_market_price = parse_row(row)["MAX (unit_price)"]

    return best_market_price

def matching_price_exists(side, order_price, best_market_price):
    if side == "bid":
        if best_market_price and best_market_price <= order_price:
            return True
    elif side == "offer":
        if best_market_price and order_price <= best_market_price:
            return True
    return False


def get_counter_order(side, price, id, cursor):
    row = cursor.execute(
        "SELECT id, amount, MIN (timestamp) FROM orders WHERE 0 < amount AND side = ? AND unit_price = ? AND product_id = ?",
        (side, price, id)
    ).fetchone()

    counter_order = parse_row(row)

    return counter_order

def get_amount_to_transact(order_amount, counter_order_amount):
    return min(order_amount, counter_order_amount)

def query_products(cursor):
    rows = cursor.execute("SELECT * FROM products").fetchall()
    products = parse_rows(rows)

    return products

def insert_product(name, symbol, cursor):
    cursor.execute(
        "INSERT OR IGNORE INTO products (name, symbol)\
    VALUES (?, ?)",
        (name, symbol),
    )

def query_book(id, cursor):
    row = cursor.execute(
        "SELECT * FROM orders WHERE product_id = ? AND 0 < amount",
        (id,),
    ).fetchall()

    book = parse_rows(row)

    return book

def query_orders(id, cursor):
    row = cursor.execute(
        "SELECT * FROM orders WHERE product_id = ?",
        (id,),
    ).fetchall()

    orders = parse_rows(row)

    return orders

def query_side(id, side, cursor):
    rows = cursor.execute(
        "SELECT * FROM orders WHERE product_id = ? AND side = ? AND 0 < amount",
        (id, side),
    ).fetchall()

    side = parse_rows(rows)

    return side

def get_user_orders(id, cursor):
    rows = cursor.execute(
        "SELECT * FROM orders WHERE address_id = ?",
        (id,),
    ).fetchall()

    user_orders = parse_rows(rows)

    return user_orders

def insert_order(data, address_id, product_id, cursor):
    cursor.execute(
        "INSERT INTO orders (address_id, side, unit_price, amount, product_id, closing_time, timestamp)\
         VALUES (?, ?, ?, ?, ?, ?, ?)",
        (
            address_id,
            data["side"],
            data["unit_price"],
            data["amount"],
            product_id,
            data["closing_time"],
            data["timestamp"],
        ),
    )

def cancel_order(id, cursor):
    cursor.execute(
        "DELETE FROM orders WHERE id = ?",
        (id,),
    )

def query_best_price_amount(side, id, price, timestamp, cursor):
    row = cursor.execute(
        "SELECT SUM (amount) FROM orders WHERE 0 < amount AND side = ? AND product_id = ? AND unit_price = ? AND ? < closing_time",
        (side, id, price, timestamp),
    ).fetchone()

    best_price_amount = parse_row(row)["SUM (amount)"]

    return best_price_amount

def query_transactions(id, cursor):
    rows = cursor.execute(
        "SELECT * FROM transactions WHERE product_id = ?",
        (id,),
    ).fetchall()

    transactions = parse_rows(rows)

    return transactions

def query_last(id, cursor):
    row = cursor.execute(
        "SELECT * FROM transactions WHERE product_id = ? ORDER BY timestamp DESC",
        (id,),
    ).fetchone()

    last_traded = parse_row(row)

    return last_traded

def query_highest(id, cursor):
    row = cursor.execute(
        "SELECT * FROM transactions WHERE product_id = ? ORDER BY unit_price DESC",
        (id,),
    ).fetchone()

    highest_traded = parse_row(row)

    return highest_traded

def query_lowest(id, cursor):
    row = cursor.execute(
        "SELECT * FROM transactions WHERE product_id = ? ORDER BY unit_price ASC",
        (id,),
    ).fetchone()

    lowest_traded = parse_row(row)

    return lowest_traded

def insert_address(sender, cursor):
    cursor.execute("INSERT OR IGNORE INTO accounts (address) VALUES (?)", (sender,))

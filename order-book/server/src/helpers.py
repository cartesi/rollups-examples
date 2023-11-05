from time import time


def create_response(success, message, data):
    response = {
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
    try:
        return dict(row)
    except:
        return None


def parse_rows(rows):
    try:
        row_list = []
        for row in rows:
            row_list.append(dict(row))
        return row_list
    except:
        None


def fetch_accounts(cursor):
    rows = cursor.execute("SELECT * FROM accounts").fetchall()
    accounts = parse_rows(rows)

    return accounts


def fetch_product_id(symbol, cursor):
    try:
        row = cursor.execute(
            "SELECT id FROM products WHERE symbol = ?", (symbol,)
        ).fetchone()
        product_id = parse_row(row)["id"]
    except:
        return None

    return product_id


def fetch_address_id(sender, cursor):
    try:
        row = cursor.execute(
            "SELECT id FROM accounts WHERE address = ?", (sender,)
        ).fetchone()
        address_id = parse_row(row)["id"]
    except:
        return None

    return address_id


def fetch_account_by_id(id, cursor):
    row = cursor.execute(
        "SELECT * FROM accounts WHERE id = ?",
        (id,)
    ).fetchone()

    account = parse_row(row)

    return account


def fetch_product_by_id(id, cursor):
    row = cursor.execute(
        "SELECT * FROM products WHERE id = ?",
        (id,)
    ).fetchone()

    product = parse_row(row)

    return product


def fetch_order_by_id(id, cursor):
    row = cursor.execute(
        "SELECT * FROM orders WHERE id = ?",
        (id,),
    ).fetchone()
    order = parse_row(row)

    return order


def fetch_transaction_by_id(id, cursor):
    row = cursor.execute(
        "SELECT * FROM transactions WHERE id = ?",
        (id,)
    ).fetchone()

    transaction = parse_row(row)

    return transaction


def fetch_address_id_by_order_id(id, cursor):
    row = cursor.execute(
        "SELECT address_id FROM orders WHERE id = ?",
        (id,)
    ).fetchone()

    address_id = parse_row(row)["address_id"]

    return address_id


def update_order_amount(amount, id, cursor):
    cursor.execute(
        "UPDATE orders SET amount = ? WHERE id = ?",
        (amount, id)
    )


def insert_transaction(side, order_id, counter_order_id, product_id, unit_price, amount, timestamp, cursor):
    if side == "bid":
        buy_order_id = order_id
        sell_order_id = counter_order_id
    elif side == "offer":
        buy_order_id = counter_order_id
        sell_order_id = order_id

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


def fetch_best_market_price(side, id, timestamp, cursor):
    if side == "bid":
        row = cursor.execute(
            "SELECT MAX (unit_price) FROM orders WHERE 0 < amount AND side = ? AND product_id = ? AND ? < closing_time",
            (side, id, timestamp),
        ).fetchone()
        best_market_price = parse_row(row)["MAX (unit_price)"]

    elif side == "offer":
        row = cursor.execute(
            "SELECT MIN (unit_price) FROM orders WHERE 0 < amount AND side = ? AND product_id = ? AND ? < closing_time",
            (side, id, timestamp),
        ).fetchone()

        best_market_price = parse_row(row)["MIN (unit_price)"]

    return best_market_price


def matching_price_exists(type, side, price_limit, best_market_price):
    if side == "bid" and best_market_price <= price_limit:
        return True
    elif side == "offer" and price_limit <= best_market_price:
        return True
    return False


def fetch_counter_order(side, price, id, cursor):
    row = cursor.execute(
        "SELECT id, amount FROM orders WHERE 0 < amount AND side = ? AND unit_price = ? AND product_id = ? ORDER BY timestamp ASC LIMIT 1",
        (side, price, id)
    ).fetchone()

    counter_order = parse_row(row)

    return counter_order


def calculate_amount_to_transact(amounts):
    return min(amounts)


def fetch_products(cursor):
    rows = cursor.execute("SELECT * FROM products").fetchall()
    products = parse_rows(rows)

    return products


def insert_product(name, symbol, cursor):
    cursor.execute(
        "INSERT OR IGNORE INTO products (name, symbol)\
    VALUES (?, ?)",
        (name, symbol),
    )


def fetch_book(id, cursor):
    row = cursor.execute(
        "SELECT * FROM orders WHERE product_id = ? AND 0 < amount",
        (id,),
    ).fetchall()

    book = parse_rows(row)

    return book


def fetch_orders(id, cursor):
    row = cursor.execute(
        "SELECT * FROM orders WHERE product_id = ?",
        (id,),
    ).fetchall()

    orders = parse_rows(row)

    return orders


def fetch_side(id, side, cursor):
    rows = cursor.execute(
        "SELECT * FROM orders WHERE product_id = ? AND side = ? AND 0 < amount",
        (id, side),
    ).fetchall()

    side = parse_rows(rows)

    return side


def fetch_user_orders(id, cursor):
    rows = cursor.execute(
        "SELECT * FROM orders WHERE address_id = ?",
        (id,),
    ).fetchall()

    user_orders = parse_rows(rows)

    return user_orders


def insert_order(data, address_id, product_id, cursor):
    cursor.execute(
        "INSERT INTO orders (address_id, type, side, unit_price, amount, product_id, closing_time, timestamp)\
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        (
            address_id,
            data["type"],
            data["side"],
            data["unit_price"],
            data["amount"],
            product_id,
            data["closing_time"],
            data["timestamp"],
        ),
    )


def update_order(data, cursor):
    cursor.execute(
        "UPDATE orders SET amount = ?, unit_price = ?, closing_time = ?, timestamp = ? WHERE id = ?",
        (data["amount"], data["unit_price"],
         data["closing_time"], data["timestamp"], data["id"])
    )


def delete_order(id, cursor):
    cursor.execute(
        "DELETE FROM orders WHERE id = ?",
        (id,),
    )


def fetch_best_price_amount(side, id, price, timestamp, cursor):
    row = cursor.execute(
        "SELECT SUM (amount) FROM orders WHERE 0 < amount AND side = ? AND product_id = ? AND unit_price = ? AND ? < closing_time",
        (side, id, price, timestamp),
    ).fetchone()

    best_price_amount = parse_row(row)["SUM (amount)"]

    return best_price_amount


def fetch_best_price_with_amount(side, id, timestamp, cursor):
    best_price = fetch_best_market_price(side, id, timestamp, cursor)
    if best_price is None:
        return None
    amount_of_orders = fetch_best_price_amount(
        side, id, best_price, timestamp, cursor)

    best_price_with_amount = {"best_price": best_price,
                              "amount_of_orders": amount_of_orders}

    return best_price_with_amount


def fetch_transactions_for_product(id, cursor):
    rows = cursor.execute(
        "SELECT * FROM transactions WHERE product_id = ?",
        (id,),
    ).fetchall()

    transactions = parse_rows(rows)

    return transactions


def fetch_last_traded_price(id, cursor):
    row = cursor.execute(
        "SELECT unit_price FROM transactions WHERE product_id = ? ORDER BY timestamp DESC",
        (id,),
    ).fetchone()

    last_traded = parse_row(row)

    return last_traded


def fetch_highest_traded_price(id, cursor):
    row = cursor.execute(
        "SELECT unit_price FROM transactions WHERE product_id = ? ORDER BY unit_price DESC",
        (id,),
    ).fetchone()

    highest_traded = parse_row(row)

    return highest_traded


def fetch_lowest_traded_price(id, cursor):
    row = cursor.execute(
        "SELECT unit_price FROM transactions WHERE product_id = ? ORDER BY unit_price ASC",
        (id,),
    ).fetchone()

    lowest_traded = parse_row(row)

    return lowest_traded


def insert_address(sender, cursor):
    cursor.execute(
        "INSERT OR IGNORE INTO accounts (address) VALUES (?)", (sender,))


def fetch_fund_by_id(id, cursor):
    row = cursor.execute(
        "SELECT * FROM funds WHERE id = ?",
        (id,),
    ).fetchone()

    fund = parse_row(row)

    return fund


def fetch_user_funds(id, cursor):
    rows = cursor.execute(
        "SELECT product_id, SUM (amount) FROM funds WHERE address_id = ? AND reserved = ? GROUP BY product_id",
        (id, 0),
    ).fetchall()

    user_funds = parse_rows(rows)

    return user_funds


def fetch_available_user_funds(id, cursor):
    rows = cursor.execute(
        "SELECT product_id, SUM (amount) FROM funds WHERE address_id = ? GROUP BY product_id",
        (id,),
    ).fetchall()

    user_funds = parse_rows(rows)

    return user_funds


def fetch_fund_for_product(address_id, product_id, cursor):
    row = cursor.execute(
        "SELECT SUM (amount) FROM funds WHERE address_id = ? AND product_id = ?",
        (address_id, product_id),
    ).fetchone()

    fund_for_product = parse_row(row)["SUM (amount)"]
    return fund_for_product


def insert_funds(address_id, product_id, amount, reserved, cursor):
    cursor.execute(
        "INSERT INTO funds (address_id, product_id, amount, reserved)\
         VALUES (?, ?, ?, ?)",
        (
            address_id,
            product_id,
            amount,
            reserved
        ),
    )


def has_enough_funds(data, address_id, product_id, cursor):
    unit_price = data["unit_price"]
    amount = data["amount"]
    side = data["side"]
    type = data["type"]

    if type == "market":
        return False

    if side == "bid":
        base_product_symbol = "CTSI"
        base_product_id = fetch_product_id(base_product_symbol, cursor)

        user_fund = fetch_fund_for_product(address_id, base_product_id, cursor)

        if user_fund and amount * unit_price <= user_fund:
            return True
        else:
            return False

    if side == "offer":
        user_fund = fetch_fund_for_product(address_id, product_id, cursor)

        if user_fund and amount <= user_fund:
            return True
        else:
            return False

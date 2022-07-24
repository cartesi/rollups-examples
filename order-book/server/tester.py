import json
import time
import traceback

from src import accounts, orders, products, transactions, funds

# Example inputs are found below.
# Uncomment the one you'd like to run and run this file with python3 tester.py
# Don't forget to initialize the db by running ./src/db/python3 seed.py

logger = "logger"


def handle_advance(payload, sender):
    try:
        if not "data" in payload:
            payload["data"] = {}
        payload["data"]["sender"] = sender
        payload["data"]["timestamp"] = int(time.time())

        if payload["resource"] == "account":
            response_payload = accounts.handle_account(payload, logger)
        elif payload["resource"] == "order":
            response_payload = orders.handle_order(payload, logger)
        elif payload["resource"] == "product":
            response_payload = products.handle_product(payload, logger)
        elif payload["resource"] == "transaction":
            response_payload = transactions.handle_transaction(payload, logger)
        elif payload["resource"] == "fund":
            response_payload = funds.handle_fund(payload, logger)
        elif payload["resource"] == "test":
            response_payload = {"status": {
                "success": True, "message": "test input received"}}
        else:
            response_payload = {"status": {
                "success": False, "message": "no or unsupported resource specified"}}

        response_payload = json.dumps(response_payload)
        print(response_payload)
    except Exception as e:
        print(e)
        msg = f"Error processing body {payload}\n{traceback.format_exc()}"
        print(json.dumps(msg))
        response = {"payload": msg}
        response_payload = json.dumps({"error_message": msg})
        print(response_payload)
        print(json.dumps(response))

# Accounts

# Get all accounts
# task = {"resource":"account","action":"get"}

# Add account
# task = {"resource": "account", "action": "add"}


# Orders

# Create a new limit buy order
# task = {"resource": "order", "action": "create", "data": {"type": "limit", "side": "bid",
#                                                           "unit_price": 11300, "amount": 2, "symbol": "ETH", "closing_time": 1872128654}}

# Create a new limit sell order
# task = {"resource": "order", "action": "create", "data": {"type": "limit", "side": "offer",
#                                                           "unit_price": 8217, "amount": 2, "symbol": "ETH", "closing_time": 1872128654}}

# Create a new market buy order
# task = {"resource": "order", "action": "create", "data": {"type": "market", "side": "bid",
#                                                           "unit_price": 0, "amount": 7, "symbol": "ETH", "closing_time": 1872128654}}

# Get your orders
# task = {"resource":"order","action":"get"}

# Modify an order
# task = {"resource":"order","action":"modify","data":{"id":1,"unit_price":8214,"amount":3,"closing_time":1872128659}}

# Cancel an order
# task = {"resource":"order","action":"cancel","data":{"id":1}}

# Get all open orders for a product
# task = {"resource":"order","action":"get_book","data":{"symbol":"ETH"}}

# Get all open + closed orders for a product
# task = {"resource":"order","action":"get_orders","data":{"symbol":"ETH"}}

# Get all bids for a product
# task = {"resource": "order", "action": "get_bids", "data": {"symbol": "ETH"}}

# Get all offers for a product
# task = {"resource":"order","action":"get_offers","data":{"symbol":"ETH"}}

# Get the highest bid for a product
# task = {"resource":"order","action":"get_bid","data":{"symbol":"ETH"}}

# Get the lowest offer for a product
# task = {"resource":"order","action":"get_offer","data":{"symbol":"ETH"}}

# Get best price for a product
# task = {"resource": "order", "action": "get_best",
#         "data": {"symbol": "ETH", "side": "bid"}}

# Get the bid-offer spread for a product
# task = {"resource":"order","action":"get_spread","data":{"symbol":"ETH"}}

# Get market data (highest bid, lowest offer and associated amount, bid-offer spread, mid-price) for a product
# task = {"resource":"order","action":"get_market","data":{"symbol":"ETH"}}


# Transactions

# Get all transactions for a product
# task = {"resource":"transaction","action":"get","data":{"symbol":"ETH"}}

# Get last traded transaction for a product
# task = {"resource":"transaction","action":"get_last_traded","data":{"symbol":"ETH"}}

# Get highest traded transaction for a product
# task = {"resource":"transaction","action":"get_highest_traded","data":{"symbol":"ETH"}}

# Get lowest traded transaction for a product
# task = {"resource":"transaction","action":"get_lowest_traded","data":{"symbol":"ETH"}}


# Products

# Get all supported products
# task = {"resource":"product","action":"get"}

# Add new product
# task = {"resource":"product","action":"add","data":{"symbol":"DMC","name":"Dummycoin"}}


# Funds

# Get user funds
# task = {"resource": "fund", "action": "get"}

# Get available user funds (not including those reserved in open orders)
# task = {"resource": "fund", "action": "get_available"}

# Add user funds for product
# task = {"resource": "fund", "action": "add",
#         "data": {"symbol": "CTSI", "amount": 35_000}}

# sender = "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92260"
sender = "0xf39fd6e51aad88f6f4ce6ab8827273cfffa91220"
# sender = "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92269"

task = {"resource": "account", "action": "add"}
handle_advance(task, sender)
task = {"resource": "fund", "action": "add",
        "data": {"symbol": "ETH", "amount": 7}}
handle_advance(task, sender)


# task = {"resource": "order", "action": "create", "data": {"type": "limit", "side": "offer",
#                                                           "unit_price": 17_000, "amount": 2, "symbol": "ETH", "closing_time": 1872128654}}
# handle_advance(task, sender)

# task = {"resource": "order", "action": "create", "data": {"type": "limit", "side": "bid",
#                                                           "unit_price": 15_500, "amount": 2, "symbol": "ETH", "closing_time": 1872128654}}
# handle_advance(task, sender)

# task = "GIVE AN ERROR"
# handle_advance(task, sender)

# task = {"resource": "fund", "action": "get_available"}
# handle_advance(task, sender)

# task = {"resource": "fund", "action": "get"}
# handle_advance(task, sender)

task = {"resource": "order", "action": "modify", "data": {
    "id": 1, "unit_price": 15_000, "amount": 333, "closing_time": 1872128659}}
handle_advance(task, sender)


# task = {"resource": "order", "action": "get_market", "data": {"symbol": "ETH"}}
# handle_advance(task, sender)

# task = {"resource": "order", "action": "get"}
# handle_advance(task, sender)

task = {"resource": "fund", "action": "get"}
handle_advance(task, sender)

task = {"resource": "fund", "action": "get_available"}
handle_advance(task, sender)

task = {"resource": "order", "action": "get"}
handle_advance(task, sender)

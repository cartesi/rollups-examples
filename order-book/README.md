# Cartesi DEX

Cartesi DEX is a Decentralized Exchange DApp created in the Cartesi environment.
The application creates and runs an SQLite database internally which holds the product, order and transaction data of the exchange. New orders are immediately matched against the order book to find matches once created and any transactions are recorded into the database.
You can send inputs with predefined structures to interact with the database and you get the results back as a notice. The available inputs are listed under [Example inputs](#example-inputs).

The following actions are supported:
- Create new orders
- Delete orders by user
- Query orders and market data
- Query transactions
- Query supported products
- Add new products

## How it works
Upon building and starting the application, a sqlite database is created with 5 tradeable products and an empty order book. Users can add orders to the order book which can get executed fully, executed partly, or wait for later execution, subject to market conditions. Order properties consist of the following:
- **product** (the product against which the base product is traded)
- **side** ("bid" for buy, "offer" for sale orders) 
- **amount** (units of product to be traded)
- **unit price** (the limit, aka best price the user would settle the trade at)
- **closing time** (a deadline for the order)

Once a buy (bid) or sell (offer) order is added into the order book, the matching function of the application loops through all open counter-side orders (offers against bids, bids against offers) of the product to find the best available price on the market. The best price is the lowest price for a buy order and the highest price for a sell order. 
If the best price is within the range of the order price limit, the matching function selects the counter-order associated with the best price. If there are more than one orders in the order book at the best price, the least recent order is selected as counter-order. Once the counter-order is selected, a transaction is initiated for the tradeable amount, which is the lower order amount of the order and the counter-order. When the transaction is created, the amount of the two orders are each reduced by the transacted amount. 
If there is any remaining open amount on the order, the loop of the matching function starts again to look for further matches. The loop continues until either the order amount reaches 0 (i.e. the full amount has traded) or the order book runs out of open orders whose price would match the order. Order matching is triggered again when a new order is added into the order book.

Example:
- **User A** adds a bid at 8212 for 3 units. As the order book is empty, there are no transactions.
- **User B** adds an offer at 8217 for 2 units. As the best bid is lower than the offer price, there are no transactions.
- **User C** adds a bid at 8219 for 4 units. As the best offer is lower than the bid price, the order can be (partly) executed. The best price is associated with **User B**'s offer, which will be matched against the bid. 2 units are traded, which is the full amount of the offer, while 2 units will remain open on **User C**'s bid. The trading price is 8217, which was the best offer price on the market. 
- **User D** adds an offer at 8210 for 5 units. The best price on the market is 8212 associated with **User A**'s bid. 3 units trade at that price, resulting in **User A**'s order being fully settled. The matching function looks for further matches and finds the current best price, which is **user C**'s remaining 2 units bid at 8219, against whom the remaining 2 units are traded at that price. With the last transaction, all open orders have been settled.

## Building the environment

To run the Cartesi Order Book example, clone the repository then, build the back-end for Cartesi Order Book:

```shell
$ cd cartesi-dex
$ make machine
```

## Running the environment

In order to start the containers in production mode, simply run:

```shell
$ docker-compose up --build
```

_Note:_ If you decide to use [Docker Compose V2](https://docs.docker.com/compose/cli-command/), make sure you set the [compatibility flag](https://docs.docker.com/compose/cli-command-compatibility/) when executing the command (e.g., `docker compose --compatibility up`).

Allow some time for the infrastructure to be ready.
How much will depend on your system, but after some time showing the error `"concurrent call in session"`, eventually the container logs will repeatedly show the following:

```shell
server_manager_1      | Received GetVersion
server_manager_1      | Received GetStatus
server_manager_1      |   default_rollups_id
server_manager_1      | Received GetSessionStatus for session default_rollups_id
server_manager_1      |   0
server_manager_1      | Received GetEpochStatus for session default_rollups_id epoch 0
```

To stop the containers, first end the process with `Ctrl + C`.
Then, remove the containers and associated volumes by executing:

```shell
$ docker-compose down -v
```

## Interacting with the application

With the infrastructure in place, you can interact with the application using a set of Hardhat tasks.

First, go to a separate terminal window, switch to the `cartesi-dex/contracts` directory, and run `yarn`:

```shell
$ cd cartesi-dex/contracts/
$ yarn
```

Then, send an input as follows:

```shell
$ yarn hardhat --network localhost cartesi-dex:addInput --input '{"resource":"test"}'
```

The input will have been accepted when you receive a response similar to the following one:

```shell
Added input '{"resource":"test"}' to epoch '0' (index: '0', timestamp: 1650886109, signer: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266, tx: 0x6a07b324d4bad477f82fd6db85d8440520a657cc674f0048217817d7188370ed)```

In order to verify the notices generated by your inputs, run the command:

```shell
$ yarn hardhat --network localhost cartesi-dex:getNotices --epoch 0
```

The response should be something like this:

```shell
{"session_id":"default_rollups_id","epoch_index":"0","input_index":"0","notice_index":"0","payload":"7b22737461747573223a207b2273756363657373223a20747275652c20226d657373616765223a20227465737420696e707574207265636569766564227d7d"}
```

To retrieve notices interpreting the payload as a UTF-8 string, you can use the `--payload string` option:

```shell
$ yarn hardhat --network localhost cartesi-dex:getNotices --epoch 0 --payload string
{"session_id":"default_rollups_id","epoch_index":"0","input_index":"0","notice_index":"0","payload":"{\"status\": {\"success\": true, \"message\": \"test input received\"}}"
```

Finally, note that you can check the available options for all Hardhat tasks using the `--help` switch:

```shell
$ yarn hardhat --help
```

## Input format

The input for the application should be in the following structure:

```json
{
  "resource": "order",
  "action": "create",
  "data": {
    "unit_price": 8212,
    "amount": 2,
    "symbol": "ETH",
    "closing_time": 1650616219,
    "timestamp": 1650537001
  }
}
```
- `side` can be `bid` for buy orders and `offer` for sell orders
- `unit_price` is the price you want to exchange the asset at
- `amount` is the amount of the asset you want to exchange
- `symbol` is the symbol of the asset
- `closing_time` is the time your offer times out. If set to `0` it never times out
- `timestamp` is the current timestamp

All assets are traded in CTSI so the price should be given in CTSI.

### Example inputs

```shell
# Orders

## Create a new buy order
$ yarn hardhat --network localhost cartesi-dex:addInput --input '{"resource":"order","action":"create","data":{"side":"bid","unit_price":8212,"amount":2,"symbol":"ETH","closing_time":1872128654,"timestamp":1650537001}}'

## Create a new sell order
$ yarn hardhat --network localhost cartesi-dex:addInput --input '{"resource":"order","action":"create","data":{"side":"offer","unit_price":8217,"amount":21,"symbol":"ETH","closing_time":1872128654,"timestamp":1650537045}}'

## Get your orders
$ yarn hardhat --network localhost cartesi-dex:addInput --input '{"resource":"order","action":"get"}'

## Delete an order
$ yarn hardhat --network localhost cartesi-dex:addInput --input '{"resource":"order","action":"delete","data":{"id":1}}'

## Get all open orders for a product
$ yarn hardhat --network localhost cartesi-dex:addInput --input '{"resource":"order","action":"get_book","data":{"symbol":"ETH"}}'

## Get all open + closed orders for a product
$ yarn hardhat --network localhost cartesi-dex:addInput --input '{"resource":"order","action":"get_orders","data":{"symbol":"ETH"}}'

## Get all bids for a product
$ yarn hardhat --network localhost cartesi-dex:addInput --input '{"resource":"order","action":"get_bids","data":{"symbol":"ETH"}}'

## Get all offers for a product
$ yarn hardhat --network localhost cartesi-dex:addInput --input '{"resource":"order","action":"get_offers","data":{"symbol":"ETH"}}'

## Get the highest bid for a product
$ yarn hardhat --network localhost cartesi-dex:addInput --input '{"resource":"order","action":"get_bid","data":{"symbol":"ETH"}}'

## Get the lowest offer for a product
$ yarn hardhat --network localhost cartesi-dex:addInput --input '{"resource":"order","action":"get_offer","data":{"symbol":"ETH"}}'

## Get the bid-offer spread for a product
$ yarn hardhat --network localhost cartesi-dex:addInput --input '{"resource":"order","action":"get_spread","data":{"symbol":"ETH"}}'

## Get market data (highest bid, lowest offer and associated amount, bid-offer spread, mid-price) for a product
$ yarn hardhat --network localhost cartesi-dex:addInput --input '{"resource":"order","action":"get_market","data":{"symbol":"ETH"}}'


# Transactions

# Get all transactions for a product
$ yarn hardhat --network localhost cartesi-dex:addInput --input '{"resource":"transaction","action":"get","data":{"symbol":"ETH"}}'

# Get last traded transaction for a product
$ yarn hardhat --network localhost cartesi-dex:addInput --input '{"resource":"transaction","action":"get_last_traded","data":{"symbol":"ETH"}}'

# Get highest traded transaction for a product
$ yarn hardhat --network localhost cartesi-dex:addInput --input '{"resource":"transaction","action":"get_highest_traded","data":{"symbol":"ETH"}}'

# Get lowest traded transaction for a product
$ yarn hardhat --network localhost cartesi-dex:addInput --input '{"resource":"transaction","action":"get_lowest_traded","data":{"symbol":"ETH"}}'


# Products

# Get all supported products
$ yarn hardhat --network localhost cartesi-dex:addInput --input '{"resource":"product","action":"get"}'

# Add new product
$ yarn hardhat --network localhost cartesi-dex:addInput --input '{"resource":"product","action":"add","data":{"symbol":"DMC","name":"Dummycoin"}}'
```

## Advancing time

To advance time, in order to simulate the passing of epochs, run:

```shell
$ yarn hardhat --network localhost util:advanceTime --seconds 864010
```

## Running the environment in host mode

When developing an application, it is often important to easily test and debug it. For that matter, it is possible to run the Cartesi Rollups environment in [host mode](../README.md#host-mode), so that the DApp's back-end can be executed directly on the host machine, allowing it to be debugged using regular development tools such as an IDE.

The first step is to run the environment in host mode using the following command:

```shell
$ docker-compose -f docker-compose.yml -f docker-compose-host.yml up --build
```

The next step is to run the cartesi-dex server in your machine. The application is written in Python, so you need to have `python3` installed.

In order to start the cartesi-dex server, run the following commands in a dedicated terminal:

```shell
$ cd cartesi-dex/server/
$ python3 -m venv .env
$ . .env/bin/activate
$ pip install -r requirements.txt
$ HTTP_DISPATCHER_URL="http://127.0.0.1:5004" gunicorn --reload --workers 1 --bind 0.0.0.0:5003 cartesi-dex:app
```

This will run the cartesi-dex server on port `5003` and send the corresponding notices to port `5004`. The server will also automatically reload if there is a change in the source code, enabling fast development iterations.

The final command, which effectively starts the server, can also be configured in an IDE to allow interactive debugging using features like breakpoints. In that case, it may be interesting to add the parameter `--timeout 0` to gunicorn, to avoid having it time out when the debugger stops at a breakpoint.

After the server successfully starts, it should print an output like the following:

```
[2022-01-21 12:38:23,971] INFO in cartesi-dex: HTTP dispatcher url is http://127.0.0.1:5004
[2022-01-21 12:38:23 -0500] [79032] [INFO] Starting gunicorn 19.9.0
[2022-01-21 12:38:23 -0500] [79032] [INFO] Listening at: http://0.0.0.0:5003 (79032)
[2022-01-21 12:38:23 -0500] [79032] [INFO] Using worker: sync
[2022-01-21 12:38:23 -0500] [79035] [INFO] Booting worker with pid: 79035
```

After that, you can interact with the application normally [as explained above](#interacting-with-the-application).

When you add an input, you should see it being processed by the cartesi-dex server as follows:

```shell
[2022-01-21 15:58:39,555] INFO in cartesi-dex: Received advance request body {'metadata': {'msg_sender': '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266', 'epoch_index': 0, 'input_index': 0, 'block_number': 11, 'time_stamp': 1642791522}, 'payload': '0x636172746573690d0a'}
[2022-01-21 15:58:39,556] INFO in cartesi-dex: Adding notice
[2022-01-21 15:58:39,650] INFO in cartesi-dex: Received notice status 201 body b'{"index":0}'
[2022-01-21 15:58:39,651] INFO in cartesi-dex: Finishing
[2022-01-21 15:58:39,666] INFO in cartesi-dex: Received finish status 202
```

Finally, to stop the containers, removing any associated volumes, execute:

```shell
$ docker-compose -f docker-compose.yml -f docker-compose-host.yml down -v
```

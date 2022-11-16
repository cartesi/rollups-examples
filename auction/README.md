# Auction DApp

The Auction DApp demonstrates how to implement an auction application on top of Cartesi Rollups.

Its business logic mostly follows the [English auction](https://en.wikipedia.org/wiki/Auction#Driven_by_bidders_only) model, meaning:

- All bids are public
- Anyone can bid, aside from the seller.
- Bids are always higher than the last one, increasing by a minimum value set by the seller.
- The minimum bid value will also determine the opening bid.
- There's no reserve price. The item will be sold by the highest bid, no matter how low.
- When time runs out the highest bidder wins the auction.

## Application components

The DApp is comprised of:

- A **wallet**, where any user can deposit their assets (ERC-20 or ERC-721 tokens) and perform transfers or withdrawals; and
- An **auction engine**, which allows users to perform operations related to an auction.

The DApp also relies on a couple of components provided along with the [other examples](../README.md#examples):

- A Cartesi NFT contract that can be used to mint tokens to be auctioned.
For more information about how to mint example NFTs, refer to the [`common-contracts` documentation](../common-contracts).
- A Command-line tool to send commands to the DApp.
Please refer to the [Front-end console documentation](../frontend-console) for more details.

## Application life-cycle

An auction can be created by a user for any ERC-721 token (NFT) they possess.
In order to create an auction, a user must first mint an NFT and deposit it in the DApp wallet. After that, any other user may place bids on the auction until the auction is finished and the NFT may be transferred to the winning bidder.

## DApp Operations

The DApp operations are split between wallet and auction operations.

### Wallet operations

Wallet operations concern depositing, transferring, and withdrawing of ERC-20 tokens or NFTs.

They may be executed with the help of the front-end console application, as mentioned bofore.

#### ERC-20 operations

##### How to deposit ERC-20 funds

Any kind of ERC-20 token may be used to place bids against an auction, depending on what token address is chosen during its creation.

For example, to deposit CTSI (see [how to deposit ERC-20 tokens](../frontend-console#depositing-erc-20-tokens)) in the default account, using the front-end console, proceed as exemplified below:

```shell
yarn start erc20 deposit --amount 10000000000000000000
```

As a result, the funds are deposited in the account wallet and made available for further use, such as placing bids on open auctions.
After the deposit is successful, a `Notice` will be issued.
One can [query the account balance via an inspect state call](#how-to-query-an-account-balance).

##### How to withdraw ERC-20 funds

Withdrawals are also executed with the help of the front-end console, by [sending inputs](../frontend-console/README.md#sending-inputs) with the command `erc20withdrawal` to the DApp.

As an example, the command below shows how to withdraw 1 CTSI (`0x610178dA211FEF7D417bC0e6FeD39F05609AD788`) from the default account:

```shell
yarn start input send --payload '{
    "method": "erc20withdrawal",
    "args": {
        "erc20": "0x610178dA211FEF7D417bC0e6FeD39F05609AD788",
        "amount": 10000000000000000000
    }
}'
```

After the command is successfully processed, the change will be reflected in the account balance and the amount will be able to be retrieved by [executing the resulting `Voucher`](../frontend-console#validating-notices-and-executing-vouchers).

Any failure will make the request being rejected and the reason will be reported as a `Report`.

##### How to transfer ERC-20 funds

Similarly to withdrawing, a transfer is executed with the help of the front-end console, by [sending inputs](../frontend-console#sending-inputs) with the command `erc20withdrawal` to the DApp.

As an example, the command below shows how to transfer 5000 *gwei* from the default account to another one:

```shell
yarn start input send --payload '{
    "method": "erc20transfer",
    "args": {
        "to": "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
        "erc20": "0x610178da211fef7d417bc0e6fed39f05609ad788",
        "amount": 5000
    }
}'
```

After the command is successfully processed, the change will be reflected in the balances of both accounts balances.

Any failure will make the request being rejected and the reason will be reported as a `Report`.

#### ERC-721 operations

Before executing any operation related to NFTs, one must first create them as explained in the section below.

##### How to mint NFTs to be auctioned

Simply proceed and [mint a CartesiNFT](../common-contracts/README.md#how-to-mint-a-cartesinft) and take note of the `token_id`.
It will be used when [depositing NFTs into a user account](#how-to-deposit-nfts) using the front-end console.

##### How to deposit NFTs

In order to [deposit NFTs](../frontend-console#depositing-erc-721-tokens), they must have been minted beforehand as explained above.

From the front-end console, deposit an NFT whose `token_id` is `1` as follows:

```shell
yarn start erc721 deposit --tokenId 1
```

As a result, the token will be deposited in the account wallet and be available to be put into an auction.
After the deposit is successful, a `Notice` will be issued.
One can [query the account balance via an inspect state call](#how-to-query-an-account-balance).

##### How to withdraw NFTs

Withdrawals can also be executed with the help of the front-end console, by [sending inputs](../frontend-console#sending-inputs) command `erc721withdrawal` to the DApp.

As an example, the command below shows how to withdraw an NFT (contract `0xc5a5C42992dECbae36851359345FE25997F5C42d`, aka locally deployed CartesiNFT contract, and `token_id` `1`) from the default account:

```shell
yarn start input send --payload '{
    "method": "erc721withdrawal",
    "args": {
        "erc721": "0xc5a5C42992dECbae36851359345FE25997F5C42d",
        "token_id": 1
    }
}'
```

After the command is successfully processed, the change will be reflected in the account balance and the NFT will be retrievable by [executing the resulting `Voucher`](../frontend-console#validating-notices-and-executing-vouchers). Any failure will make the request be rejected, and the reason will be reported as a `Report`.

##### How to transfer NFTs

Similarly to withdrawing, a transfer is executed with the help of the front-end console, by [sending inputs](../frontend-console#sending-inputs) with the command `erc721transfer` to the DApp.

As an example, the command below shows how to transfer an NFT from the default account to another one:

```shell
yarn start input send --payload '{
    "method": "erc721transfer",
    "args": {
        "to": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        "erc721": "0xc5a5c42992decbae36851359345fe25997f5c42d",
        "token_id": 1
    }
}'
```

After the command is successfully processed, the change will be reflected in the balances of both accounts. As a result, the account identified by the `to` field will be able to create an auction with that NFT.

Any failure will make the request being rejected and the reason will be reported as a `Report`.

#### Querying the wallet state

The state of any account may be queried at any time via [inspect state calls](../frontend-console#inspecting-dapp-state).

##### How to query an account balance

In order to retrieve an account balance, send an inspect request against `balance` passing the account address as part of the URL.
The example below shows how to query the balance of default account `0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266`:

```shell
yarn start inspect \
    --payload  balance/0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
```

The account balance, which may be split into `erc20` balance and `erc721` ownership, will be returned as a *Report* as exemplified below:

```shell
$ yarn start inspect --payload  balance/0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
yarn run v1.22.19
$ ts-node src/index.ts inspect --payload balance/0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
HTTP status: 200
Inspect status: "Accepted"
Metadata: {"active_epoch_index":0,"current_input_index":8}
Reports:
0: {"erc721": {"0xc5a5c42992decbae36851359345fe25997f5c42d": [1]}, "erc20": {"0x610178da211fef7d417bc0e6fed39f05609ad788": 100000000}}
✨  Done in 3.88s.
```

### Auction operations

Auction operations cover:

- Creating auctions;
- Placing bids on auctions; and
- Finishing auctions.

#### How to create an auction

In order to create an auction a user MUST provide the following data as part of an input:

- the NFT (`item`) to be auctioned, by indicating the ERC-721 contract and the correspondent `token_id`;
- the ERC-20 contract corresponding to the token in which bid amounts must be denominated;
- title and description;
- start and end dates;
- a minimum bid amount.

Example command:

```shell
yarn start input send --payload '{
    "method": "create",
    "args": {
        "item": {
            "erc721": "0xc5a5C42992dECbae36851359345FE25997F5C42d",
            "token_id": 1
        },
        "erc20": "0x610178dA211FEF7D417bC0e6FeD39F05609AD788",
        "title": "Default title for testing",
        "description": "Default description for testing",
        "start_date": 1693507978,
        "end_date": 1694372013,
        "min_bid_amount": 1
    }
}'
```

*NOTE*: An auction may only be created for NFTs belonging to the user who requests its creation.
See [how to deposit NFTs](#how-to-deposit-nfts) above.

#### How to place bids

In order to place a bid, a user must inform:

- the `auction_id` against which the bid should be placed;
- the `amount` of funds, according to the token set during the creation of the auction.

For example, to place a bid against `auction_id 1`, proceed as follows:

```shell
yarn start input send --payload '{
    "method": "bid",
    "args": {
        "amount": 1000,
        "auction_id": 0
    }
}'
```

*NOTE*: A bid may only be placed against auctions that are currently active.

#### How to finish an auction

An auction will only be ended after its end date has passed. After that, no bids will be accepted.
However, in order to set an auction as complete, a user must issue a command informing:

- the `auction_id`; and
- whether they want to `withdraw` the NFT that is being auctioned.

A voucher for withdrawing the NFT will only be issued if the user who made the request is the actual winner of the auction.

For example, to finish `auction_id 1` and request to withdraw the NFT, proceed as follows:

```shell
yarn start input send --payload '{
    "method": "end",
    "args": {
        "auction_id": 1,
        "withdraw": true
    }
}'
```

### Querying auction data

The DApp state may be queried at any time via *inspect state* calls, which may be easily performed with the help of the [front-end console](../frontend-console) application.

#### How to query a single auction

In order to query data from an auction, simply send an inspect request specifying the auction `id`.

As an example, the following request queries data from auction `0`:

```shell
yarn start inspect --payload auctions/0
```

#### How to list the existing bids for a given auction

Similarly, one can list the bids of a given auction by specifying its `id` through an *inspect state* request.

The following example shows how to list all bids from auction `0`:

```shell
yarn start inspect --payload auctions/0/bids
```

#### How to list auctions

In order to list all existing auctions, simply send an inspect state request with the URL `auctions` as follows:

```shell
yarn start inspect --payload auctions
```

Example output:

```shell
$ yarn start inspect --payload auctions
yarn run v1.22.19
$ ts-node src/index.ts inspect --payload auctions
HTTP status: 200
Inspect status: "Accepted"
Metadata: {"active_epoch_index":0,"current_input_index":9}
Reports:
0: {"0": {"id": 0, "state": 0, "item": {"erc721": "0xc5a5c42992decbae36851359345fe25997f5c42d", "token_id": 1}, "erc20": "0x610178da211fef7d417bc0e6fed39f05609ad788", "title": "Default title for testing", "description": "Default description for testing", "start_date": 1693507978.0, "end_date": 1694372013.0, "min_bid_amount": 1, "bids": []}}
✨  Done in 3.27s.
```

##### How to sort auctions

Auction lists are sorted by their IDs in ascending order by default.
However, that order may be changed by providing any other auction attribute as value to the parameter `sort` when querying the available auctions.

As an example, auctions can be ordered by their `start_date` as follows:

```shell
yarn start inspect --payload "auctions?sort=start_date"
```

*NOTE:* In case multiple `sort` parameters are provided, only the first one will be considered.

##### How to traverse auctions

A list of auctions may also be traversed by means of parameters `offset`, which defines how many entries are to be skipped in the auction list, and `limit`, which limits the size of the list.

For example, the query below returns a maximum of `10` auctions from the currently available auctions, starting from the third one:

```shell
yarn start inspect --payload "auctions?limit=10&offset=3"
```

Auctions may also be sorted and traversed by combining `sort`, `limit`, and `offset` as shown in the example below, which returns a list of a maximum of `20` auctions starting from the 40th auction sorted by `end_date`:

```shell
yarn start inspect --payload "auctions?sort=end_date&limit=20&offset=40"
```

### Running the back-end in host mode

When developing an application, it is often important to easily test and debug it. For that matter, it is possible to run the Cartesi Rollups environment in [host mode](https://github.com/cartesi/rollups-examples/tree/main/README.md#host-mode), so that the DApp's back-end can be executed directly on the host machine, allowing it to be debugged using regular development tools such as an IDE.

This DApp's back-end is written in Python, so to run it in your machine you need to have `python3` installed.

In order to start the back-end, run the following commands in a dedicated terminal:

```shell
cd auction/
python3 -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
ROLLUP_HTTP_SERVER_URL="http://127.0.0.1:5004" python3 -m auction.dapp
```

The final command will effectively run the back-end and send corresponding outputs to port `5004`.
It can optionally be configured in an IDE to allow interactive debugging using features like breakpoints.

You can also use a tool like [entr](https://eradman.com/entrproject/) to restart the back-end automatically when the code changes. For example:

```shell
ls auction/*.py | ROLLUP_HTTP_SERVER_URL="http://127.0.0.1:5004" entr -r python3 -m auction.dapp
```

After the back-end successfully starts, it should print an output like the following:

```log
INFO:__main__:HTTP rollup_server url is http://127.0.0.1:5004
INFO:__main__:Sending finish
```

After that, you can interact with the application normally using the [DApp operations](#dapp-operations).

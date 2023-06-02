#!/bin/bash

# Running at localhost we are using Hardhat default test mneumonic.
# These are the addresses and indexes of these accounts.
# 'ALICE' being the index 0 one, is the one used to deploy SimpleERC20 contract
# This gives 'her' all the tokens
# frontend-console also defaults to 'ALICE' when no account index is given

ALICE=0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
ALICE_INDEX=0
BOB=0x70997970C51812dc3A010C7d01b50e0d17dc79C8
BOB_INDEX=1
CHARLIE=0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
CHARLIE_INDEX=2


# This scrit is intended to be used to setup an auction at 
# a local Rollups deployment.
#
# This script uses frontend-console and Foundry Cast to interact
# with the blockchain and the DApp
#
# The script executes the following steps:
#
# 1 - Send to the DApp it's address
#     The DApp itself do not know it's own address. Here we use the
#     DApp Address Relay to inform it to the DApp so it can use this 
#     when issuing vouchers
#     It is expected to generate a report with a payload similar to
#     'DApp address set up successfully to 0xHHHHHHHHHHHHHH'
#
# 2 - Transfer funds from the default account "ALICE" to other accounts
#     so they can act as biders
#     It is expected to see funds when executing the method 'balanceOf(address)'
#     from the SimpleERC20 contract for "BOB" and "CHARLIE"
# 
# 3 - Mint an NFT for "ALICE"
#     It is expected to see at the console a message like this
#     "Token 1 was minted for 0xXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX at tx: 0xXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
#
# 4 - Deposit ERC20 tokens for each account (ALICE, BOB and CHARLIE)
#     It is expected to generate a deposit notice for each one. Their payload looks like this:
#     {\"type\": \"erc20deposit\", \"content\": {\"address\": \"0xXXXXXXXXXXXXXXXXXXX\", \"erc20\": \"0xXXXXXXXXX\", \"amount\": 9999999}
# 
# 5 - Deposit the NFT to be auctioned
#     It is expected to generate a deposit notice whoose payload looks like this:
#     {\"type\": \"erc721deposit\", \"content\": {\"address\": \"0xXXXXXXXXXXXXXXXXXX\", \"erc721\": \"0xXXXXXXXXX\", \"token_id\": 9}
#
# 6 - ALICE creates the auction
#     It is expected to generate an notice whoose payload looks like this:
#     {\"type\": \"auction_create\", \"content\": {\"id\": 0, \"state\": 0, \"creator\": \"0xXXXXXXXXXXXXXXXXXXXXXXXX\", \"item\": {\"erc721\": \"0xXXXXXXXXXXXXXXXXXXXXXXXX\", \"token_id\": 1}, \"erc20\": \"0xXXXXXXXXXXXXXXXXXXXXXXXX\", \"title\": \"Default title for testing\", \"description\": \"Default description for testing\", \"start_date\": 999999999, \"end_date\": 999999999, \"min_bid_amount\": 1}     
#
# 7 - BOB and CHARLIE place bids
#     It is epected to generate 10 notices whoose payload looks like this:
#     {\"type\": \"auction_bid\", \"content\": {\"auction_id\": 0, \"author\": \"0xXXXXXXXXXXXXXXXXXXXX\", \"amount\": 1, \"timestamp\": 99999999}


echo "===========> Start local Auction Setup"

echo "===========> Configure DApp Address"
DAPP_ADDRESS=$(cat deployments/localhost/dapp.json | jq -r '.address')
ADDRESS_RELAY=$(cat deployments/localhost/DAppAddressRelay.json | jq -r '.address')

echo "DApp address is $DAPP_ADDRESS"
echo "DApp address relay is $ADDRESS_RELAY"
echo "cast send $ADDRESS_RELAY \"relayDAppAddress(address)\" $DAPP_ADDRESS --mnemonic \"test test test test test test test test test test test junk\" --mnemonic-index $ALICE_INDEX --rpc-url \"http://localhost:8545\""

cast send $ADDRESS_RELAY "relayDAppAddress(address)" $DAPP_ADDRESS --mnemonic "test test test test test test test test test test test junk" --mnemonic-index $ALICE_INDEX --rpc-url "http://localhost:8545"

echo "===========> Deploy aux contracts"
cd ../common-contracts
yarn && yarn build

ERC_721=$(cat deployments/localhost/SimpleERC721.json | jq -r '.address')
ERC_20=$(cat deployments/localhost/SimpleERC20.json | jq -r '.address')

echo "===========> Transfer funds from ALICE to BOB and CHARLIE, so bidders can participate"
cast send $ERC_20 "transfer(address,uint256)(bool)" $BOB 1000 --mnemonic "test test test test test test test test test test test junk" --mnemonic-index $ALICE_INDEX --rpc-url "http://localhost:8545"
cast send $ERC_20 "transfer(address,uint256)(bool)" $CHARLIE 1000 --mnemonic "test test test test test test test test test test test junk" --mnemonic-index $ALICE_INDEX --rpc-url "http://localhost:8545"


echo "===========> Mint a NFT"
npx hardhat mint-token \
    --recipient $ALICE \
    --erc721 $ERC_721 \
    --network localhost

cd ../frontend-console
yarn && yarn build

echo "===========> Deposit erc20 tokens"
yarn start erc20 deposit --amount 100000
yarn start erc20 deposit --amount 1000 --accountIndex $BOB_INDEX
yarn start erc20 deposit --amount 1000 --accountIndex $CHARLIE_INDEX

echo "===========> Deposit the NFT"
yarn start erc721 deposit --tokenId 1

timestamp=$(( $(date +%s) + 30 ))
end_date=$(($timestamp + 300))

echo "===========> Create an auction starting in $timestamp and ending in $end_date"
yarn start input send --payload '{
    "method": "create",
    "args": {
        "item": {
            "erc721": "'$ERC_721'",
            "token_id": 1
        },
        "erc20": "'$ERC_20'",
        "title": "Default title for testing",
        "description": "Default description for testing",
        "start_date": '$timestamp',
        "end_date": '$end_date',
        "min_bid_amount": 1
    }
}'

echo "===========> Wait Auction to start"
sleep 50

echo "===========> Place bids"
yarn start input send --accountIndex $BOB_INDEX --payload '{    "method": "bid",
    "args": {
        "amount": 1,
        "auction_id": 0
    }
}'
yarn start input send --accountIndex $CHARLIE_INDEX --payload '{    "method": "bid",
    "args": {
        "amount": 2,
        "auction_id": 0
    }
}'
yarn start input send --accountIndex $BOB_INDEX --payload '{    "method": "bid",
    "args": {
        "amount": 3,
        "auction_id": 0
    }
}'

yarn start input send --accountIndex $CHARLIE_INDEX --payload '{    "method": "bid",
    "args": {
        "amount": 4,
        "auction_id": 0
    }
}'

yarn start input send --accountIndex $BOB_INDEX --payload '{    "method": "bid",
    "args": {
        "amount": 5,
        "auction_id": 0
    }
}'

yarn start input send --accountIndex $CHARLIE_INDEX --payload '{    "method": "bid",
    "args": {
        "amount": 6,
        "auction_id": 0
    }
}'

yarn start input send --accountIndex $BOB_INDEX --payload '{    "method": "bid",
    "args": {
        "amount": 7,
        "auction_id": 0
    }
}'

yarn start input send --accountIndex $CHARLIE_INDEX --payload '{    "method": "bid",
    "args": {
        "amount": 8,
        "auction_id": 0
    }
}'

yarn start input send --accountIndex $BOB_INDEX --payload '{    "method": "bid",
    "args": {
        "amount": 9,
        "auction_id": 0
    }
}'

yarn start input send --accountIndex $CHARLIE_INDEX --payload '{    "method": "bid",
    "args": {
        "amount": 10,
        "auction_id": 0
    }
}'

echo "===========> Done!"

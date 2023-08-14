#!/bin/bash

ADDRESS_RELAY="0x8Bbc0e6daB541DF0A9f0bDdA5D41B3B08B081d55"
DAPP_ADDR="0x142105FC8dA71191b3a13C738Ba0cF4BC33325e2"
PRIVATE_KEY="0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80" # private key for addr 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
RPC_URL="http://localhost:8545"

cast send --private-key ${PRIVATE_KEY} --rpc-url ${RPC_URL} $ADDRESS_RELAY "relayDAppAddress(address)" $DAPP_ADDR
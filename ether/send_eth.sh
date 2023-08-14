#!/bin/bash

if [ $# != 1 ]
then
    echo "Missing arguments: amount of ether to send"
    echo "Usage: send_eth.sh <ether amount>"
    exit 0
fi

ETHER=$1    # amount of ETHER to send to the DApp
ETHER_PORTAL_ADDR="0xA89A3216F46F66486C9B794C1e28d3c44D59591e"
DAPP_ADDR="0x142105FC8dA71191b3a13C738Ba0cF4BC33325e2"
PRIVATE_KEY="0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80" # private key for addr 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
RPC_URL="http://localhost:8545"
EXE_LAYER_DATA="0x"   # data to be sent to the DAPP with the deposit

cast send --private-key ${PRIVATE_KEY} --rpc-url ${RPC_URL} ${ETHER_PORTAL_ADDR} "depositEther(address,bytes)" ${DAPP_ADDR} ${EXE_LAYER_DATA} --value "${ETHER}ether"
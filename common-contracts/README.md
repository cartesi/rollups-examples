<!-- markdownlint-disable MD013 -->

# Overview

This project makes available contracts that can be used by any example DApp.

## Building

You may build the `common-contracts` project as follows:

```shell
cd common-contracts
yarn && yarn build
```

## Deploying

Usually, DApp examples that require these contracts will specify their deployment within their corresponding `docker-compose.override.yml` file.

Additionally, the project can be deployed manually on the local development network by running `yarn deploy`. Manual deployment to other supported testnets can be done by executing `yarn deploy:<network>`.

## The Contracts

This project presents contracts that can be used by any example DApp

### SimpleERC721

This is a simple contract to perform operations with NFTs.

To use it, you must first retrieve the contract address from the deployment data.
For the local development network, execute the following command:

```shell
ERC_721=$(jq '.address' ./deployments/localhost/SimpleERC721.json | \
    sed "s/[\",]//g")
```

With that in place, you can mint a new ERC-721 token with the following command:

```shell
npx hardhat mint-token \
    --recipient 0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266 \
    --erc721 $ERC_721 \
    --network localhost
```

After the minting process finishes, a resulting token *id* will be printed.
For example, *id* `1` was minted in the example below:

```shell
$ npx hardhat mint-token --recipient 0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266 --erc721 $ERC_721 --network localhost
Token 1 was minted for 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 at tx: 0xbb884e186fc09f65d8116e7b100c0674449b5ebf04c9a32fee9ec828007aa9b3
```

### SimpleERC20

This is a simple contract perform operations with fungible tokens.

To use it, you must first retrieve the contract address from the deployment data.
For the local development network, execute the following command:

```shell
ERC_20=$(jq '.address' ./deployments/localhost/SimpleERC20.json | \
    sed "s/[\",]//g")
```

With that in place, you can make transactions such as transferring tokens between accounts:

```shell
cast send $ERC_20 \
    "transfer(address,uint256)(bool)" \
    0x70997970C51812dc3A010C7d01b50e0d17dc79C8 \
    1000 \
    --mnemonic "test test test test test test test test test test test junk" \
    --mnemonic-index 0 \
    --rpc-url "http://localhost:8545"
```

The balance of an address can also be queried with the following command:

```shell
cast call $ERC_20 \
    "balanceOf(address)(uint32)" \
    0x70997970C51812dc3A010C7d01b50e0d17dc79C8 \
    --rpc-url "http://localhost:8545"
```

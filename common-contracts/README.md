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

## CartesiNFT

This is an ERC-721 contract that can be used by any example DApp that performs operations on NFTs.

### How to mint a CartesiNFT

First, retrieve the contract address from the deployment data.

For the local development network, execute the following command:

```shell
ERC_721=$(grep 0x deployments/localhost/localhost_aux.json | \
    awk '{print $2}' | \
    sed "s/[\",]//g")
```

With that in place, mint a new NFT:

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

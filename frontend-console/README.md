# Frontend Console

This project demonstrates how to implement a console application to send inputs to a Cartesi Rollups DApp, both locally and on Polygon Mumbai testnet.
It's implemented in typescript and uses the [ethers](https://docs.ethers.io/v5/) library to communicate with the rollups smart contracts.

## Requirements

- node.js
- yarn

## Running

```bash
$ yarn
$ yarn build
$ yarn start --help

index.ts [command]

Commands:
  index.ts notices List notices of an epoch and input
  index.ts send [message] Send input to dapp

Options:
  --help     Show help                                                 [boolean]
  --version  Show version number                                       [boolean]
```

## Sending input

TL/DR:

```shell
yarn
yarn build
yarn start send
```

For more information:

```shell
$ yarn start send --help
index.ts send [message]

Send string input to dapp

Positionals:
  message                                                               [string]

Options:
  --help      Show help                                                [boolean]
  --version   Show version number                                      [boolean]
  --network   Network to use   [string] [choices: "localhost", "polygon_mumbai"]
  --address   Rollups contract address                                  [string]
  --mnemonic  Wallet mnemonic                                           [string]
```

To send an input to the DApp you need a wallet with funds to send the input transaction.

If you are running a local private network you can use the default wallet mnmemonic of the hardhat node, which is already funded: `test test test test test test test test test test test junk`.
If you intend to send the input to Polygon Mumbai you need a wallet with MATIC tokens which you can get from [Polygon Mumbai Faucet](https://faucet.polygon.technology/).

You can pass the wallet mnemonic to the `--mnemonic` option or set an environment variable called `MNEMONIC`. Alternatively the application will ask for the mnemonic interactively.

## List notices

TL/DR:

```shell
yarn
yarn build
yarn start notices
```

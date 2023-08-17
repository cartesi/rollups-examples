<!-- markdownlint-disable MD013 -->

# Frontend Console

This project demonstrates how to implement a console application to send inputs to a Cartesi Rollups DApp, both running locally and deployed on remote testnet networks.
It's implemented in Typescript and uses the [ethers](https://docs.ethers.io/v5/) library to communicate with the rollups smart contracts.

## Requirements

- node.js
- yarn

## Building

To build the console application, first clone the repository as follows:

```shell
git clone https://github.com/cartesi/rollups-examples.git
```

Then, build the application by executing the following commands:

```shell
cd frontend-console/
yarn
yarn build
```

## Running

The console application can be used to perform several operations. The available commands can be queried as follows:

```shell
$ yarn start --help

Commands:
  index.ts erc20 <command>    Operations with ERC-20 tokens
  index.ts erc721 <command>   Operations with ERC-721 tokens
  index.ts input <command>    Operations with inputs
  index.ts inspect            Inspect the state of the DApp
  index.ts notice <command>   Operations with notices
  index.ts report <command>   Operations with reports
  index.ts voucher <command>  Operations with vouchers

Options:
  --help     Show help                                                 [boolean]
  --version  Show version number                                       [boolean]
```

In general terms, the application communicates with a Cartesi DApp through two different endpoints, one for layer-1 communication (underlying blockchain) and another for layer-2 communication (Cartesi Node). Layer-1 communication is used for sending data to the DApp, including depositing assets. On the other hand, communication through the layer-2 node is used when querying DApp information such as provable outputs (notices, vouchers) and application logs (reports), or when performing generic application-level queries (inspect).

### Sending inputs

The `input send` command adds inputs to a Cartesi Rollups DApp and has the following format:

```shell
yarn start input send --payload [message] <options>
```

Examples:

1. Send an input to the current locally deployed DApp using Hardhat's default funded account:

    ```shell
    yarn start input send --payload "my message"
    ```

1. Send an input to an instance of the `echo-python` DApp already deployed to the Ethereum Sepolia testnet, using a user's account and a user's gateway RPC on Alchemy:

    ```shell
    export MNEMONIC=<user sequence of twelve words>
    export RPC_URL=https://eth-sepolia.g.alchemy.com/v2/<USER_KEY>

    yarn start input send --payload "my message" --dapp echo-python
    ```

#### Options

When sending data to a DApp, the console application needs to communicate with the underlying layer-1 blockchain. In order to do that, it needs the URL of a blockchain RPC gateway, the address of the DApp's Rollups smart contract on that blockchain, and an appropriate account with sufficient funds for submitting transactions to the network.

The following parameters are available to specify this configuration, with some default behaviors and values to make it convenient to the user, especially for a local development environment:

- **`--rpc`**: provides the RPC URL of the remote blockchain gateway; if absent, its default value is "http://localhost:8545", which provides connectivity to the Hardhat node used for local development; it may also be specified by setting a value for the environment variable `RPC_URL`;
- **`--address`**: represents an explicit definition for the address of the DApp's Rollups smart contract, given as a hex string; if absent, the console application will look for other ways to determine this address, as explained below
- **`--addressFile`**: provides a path to a file containing the address as a hex string, and is only used if `address` is absent
- **`--dapp`**: specifies the name of the DApp, with a default value of "dapp"; if both `address` and `addressFile` are absent, the console application will query the given RPC instance to infer the network being used, and will extract the DApp's address from file `../deployments/<network>/<dapp>.json`; as such, if none of the above parameters are specified, the DApp address will be determined by looking for the file `../deployments/localhost/dapp.json`;
- **`--mnemonic`**: determines an account for submitting transactions; when using the `localhost` network, the application will use the default `mnemonic` for the local Hardhat node, which is already funded; otherwise, you must define a mnemonic for an account that has funds in the specified network; you can also define this parameter by setting the `MNEMONIC` environment variable;
- **`--accountIndex`**: specifies an account index to use from the provided mnemonic; if absent, index `0` is used;

### Listing notices, vouchers and reports

The `notice list`, `voucher list` and `report list` commands display DApp notices, vouchers and reports associated with the given epoch and input.

```shell
yarn start notice list <options>
```

```shell
yarn start voucher list <options>
```

```shell
yarn start report list <options>
```

Examples:

1. List all notices ever emitted for the current locally deployed DApp:

    ```shell
    yarn start notice list
    ```

1. List all vouchers emitted for input `1` of the current locally deployed DApp:

    ```shell
    yarn start voucher list --input 1
    ```

1. List notices for input `3` of an `echo-python` DApp instance already deployed remotely:

    ```shell
    yarn start notice list --url https://<dapp-cartesi-node-url>/graphql --input 3
    ```

Options are:

```shell
--url      Reader URL
--input    Input index
```

If the `url` parameter is absent, the console application will use a default value of "http://localhost:4000/graphql", which provides connectivity to the local Cartesi Node.

### Validating notices and executing vouchers

The `notice validate` command can be used to check if a given notice is authentic, meaning that its associated proof can be successfully verified by the Cartesi Rollups framework.
In a similar way, the `voucher execute` command can be used to submit a transaction on layer-1 as an output of a Cartesi DApp (e.g., to withdraw funds back from the Rollups framework).

Both commands can only be executed if a proof is available for the specified notice or voucher. Proofs are only effectively produced when its associated epoch finishes, which happens after the DApp's configured epoch period elapses (e.g., after one week). In a local development environment, it is possible to explicitly [advance time](../README.md#advancing-time) in order to finish an epoch and have proofs be generated by the framework.

```shell
yarn start notice validate --index [index] --input [input] <options>
```

```shell
yarn start voucher execute --index [index] --input [input] <options>
```

Examples:

1. Validate notice with index `0` of input `1` for the current locally deployed DApp, using Hardhat's default funded account:

    ```shell
    yarn start notice validate --index 0 --input 1
    ```

1. Execute voucher with index `1` of input `3` for the current locally deployed DApp, using Hardhat's default funded account:

    ```shell
    yarn start voucher execute --index 1 --input 3
    ```

1. Validate notice with index `0` of input `5` for an `echo-python` DApp already deployed to the Ethereum Sepolia testnet, using a user's account and a user's gateway RPC on Alchemy:

    ```shell
    export MNEMONIC=<user sequence of twelve words>
    export RPC_URL=https://eth-sepolia.g.alchemy.com/v2/<USER_KEY>

    yarn start notice validate --index 0 --input 5 --dapp echo-python --url https://<dapp-cartesi-node-url>/graphql
    ```

Options are:

```shell
--index         Notice or Voucher index within its associated Input
--input         Input index
--rpc           URL of the RPC gateway to use
--address       DApp Rollups contract address
--addressFile   Path to a file containing the DApp Rollups contract address
--dapp          DApp name
--mnemonic      Wallet mnemonic
--accountIndex  Account index from mnemonic
--url           Reader URL
```

The `url` parameter has the same behavior as described for the [notice/voucher list](#listing-notices-and-vouchers) commands, whereas the other parameters behave as in the [input send](#options) command.

### Inspecting DApp state

The `inspect` command directly queries the DApp state within the Cartesi Machine. It can be used to send DApp-specific payloads that are interpreted by the application logic to yield a synchronous response.
In practice, this command simply sends an HTTP GET request to the specified inspect URL, and does a little bit of parsing on the response.

```shell
yarn start inspect --payload [payload] <options>
```

Examples:

1. Inspect the state of the locally deployed DApp using a REST-like query:

    ```shell
    yarn start inspect --payload "myresource?attr1=value1&attr2=value2"
    ```

1. Inspect the state of the `echo-python` DApp instance already deployed remotely:

    ```shell
    yarn start inspect --payload "mypayload" --url https://<dapp-cartesi-node-url>/inspect
    ```

Options are:

```shell
--url      Reader inspect URL
```

If the `url` parameter is absent, the console application will use a default value of "http://localhost:5005/inspect", which provides connectivity to the local Cartesi Node.

### Depositing tokens

Deposits of both ERC-20 and ERC-721 tokens are supported via similar commands.
Aside from what is described in the sections below, the commands parameters behave as described for the [input send](#options) command.

#### Depositing ERC-20 tokens

The `erc20 deposit` command deposits ERC-20 tokens in the DApp.

```shell
yarn start erc20 deposit --amount [amount] <options>
```

Examples:

1. Deposit 10 CTSI in the locally deployed DApp:

    ```shell
    yarn start erc20 deposit --amount 10000000000000000000
    ```

1. Deposit 10 CTSI in the `echo-python` DApp instance already deployed to the Ethereum Sepolia testnet, using a user's account and a user's gateway RPC on Alchemy:

    ```shell
    export MNEMONIC=<user sequence of twelve words>
    export RPC_URL=https://eth-sepolia.g.alchemy.com/v2/<USER_KEY>

    yarn start erc20 deposit --amount 10000000000000000000 --dapp echo-python
    ```

Options are:

```shell
--erc20         ERC-20 address
--rpc           URL of the RPC gateway to use
--address       DApp Rollups contract address
--addressFile   Path to a file containing the DApp Rollups contract address
--dapp          DApp name
--mnemonic      Wallet mnemonic
--accountIndex  Account index from mnemonic
```

If the `erc20` address is unspecified, the appropriate address for the SimpleERC20 token will be used for the target blockchain being specified.

#### Depositing ERC-721 tokens

The `erc721 deposit` command deposits ERC-721 tokens in the DApp.

```shell
yarn start erc721 deposit --tokenId [token_id] <options>
```

Examples:

1. Deposit token with id `1` in the locally deployed DApp:

    ```shell
    yarn start erc721 deposit --tokenId 1
    ```

1. Deposit token with id `1` in the `echo-python` DApp instance already deployed to the Ethereum Sepolia testnet, using a user's account and a user's gateway RPC on Alchemy:

    ```shell
    export MNEMONIC=<user sequence of twelve words>
    export RPC_URL=https://eth-sepolia.g.alchemy.com/v2/<USER_KEY>

    yarn start erc721 deposit --tokenId 1 --dapp echo-python
    ```

Options are:

```shell
--rpc           URL of the RPC gateway to use
--mnemonic      Wallet mnemonic
--accountIndex  Account index from mnemonic
--address       DApp Rollups contract address
--addressFile   Path to a file containing the DApp Rollups contract address
--dapp          DApp name
--erc721        ERC-721 contract address
--tokenId       The ID of the token being transfered
```

If the `erc721` address is left unspecified, the address for the SimpleERC721 contract will be used for the target blockchain being specified.

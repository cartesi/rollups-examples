<!-- markdownlint-disable MD013 -->

# Cartesi Rollups Examples

This repository includes examples of decentralized applications implemented using [Cartesi Rollups](https://github.com/cartesi/rollups).

You can use online development environments such as [Gitpod](https://gitpod.io/) and [CodeSandbox](https://codesandbox.io) to open this repository directly in your browser with all [required dependencies](https://cartesi.io/docs/build-dapps/requirements) already installed. These services allow you to start experimenting immediately, but keep in mind that they are provided by third-parties and are subject to unavailability and policy changes. They may also require access to your GitHub account in order to work properly.

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#prebuild/https://github.com/cartesi/rollups-examples/)

## Introduction

From a developer’s point of view, each decentralized application or _DApp_ is composed of two main parts: a **front-end** and a **back-end**.

The **front-end** corresponds to the user-facing interface, which for these examples will correspond to a [command-line console application](./frontend-console).

On the other hand, the **back-end** contains the business logic of the application, similar to what traditional systems would run inside a server. Its basic goal is to store and update the application state as user input is received, producing corresponding outputs. These outputs can come in the form of **vouchers** (transactions that can be carried out on layer-1, such as a transfer of assets) and **notices** (informational statements that can be verified on layer-1, such as the resulting score of a game). In addition to that, the back-end can also issue **reports**, which correspond to general information that does not need to be verifiable by third-parties, such as application logs.

When compared to traditional software development, the main difference of a Cartesi DApp is that the back-end is deployed to a decentralized network of layer-2 nodes, who continuously verify the correctness of all processing results. As a consequence, the front-end and back-end do not communicate directly with each other. Rather, the front-end sends inputs to the Cartesi Rollups framework, who in turn makes them available to the back-end instances running inside each node. After the inputs are processed by the back-end logic, the corresponding outputs are then informed back to the Rollups framework, which enforces their correctness and makes them available to the front-end and any other interested parties.

## HTTP API

As discussed above, the front-end and back-end parts of a Cartesi DApp communicate with each other through the Rollups framework.
This is accomplished in practice by using a set of HTTP interfaces, which are specified in [Cartesi's OpenAPI Interfaces repository](https://github.com/cartesi/openapi-interfaces/).

### Back-end

The DApp's back-end interacts with the Cartesi Rollups framework by retrieving processing requests and then submitting corresponding outputs.

### Front-end

The front-end part of the DApp needs to access the Cartesi Rollups framework to submit user inputs and retrieve the corresponding vouchers, notices and reports produced by the back-end.
As mentioned before, it is possible to interact with all the examples in this repository through the minimalistic and general-purpose [frontend-console](./frontend-console) application.

## Requirements

Docker version `20.10.14` is required for building the environment and executing the examples.

The below instructions have been tested in systems running both Linux (Ubuntu), MacOS, and Windows (using [WSL](https://docs.microsoft.com/en-us/windows/wsl/install), which is highly recommended for Windows users).

## Building

To run the examples, first clone the repository as follows:

```shell
git clone https://github.com/cartesi/rollups-examples.git
```

Then, for each example, build the required docker images:

```shell
cd <example>
docker buildx bake --load
```

This will also build the example's Cartesi Machine containing the DApp's back-end logic.

The file `<example>/dapp.json` contains some configurations for building the application. In particular, it defines the back-end's entry-point executable, along with any other files that should be made available inside the Cartesi Machine.
For certain examples, the build process also includes special [procedures for downloading and installing additional dependencies](./calculator/README.md#installing-extra-dependencies) required by the application.

## Running

Each application can be executed in Production and Host modes, as explained below.

### Production mode

In this mode, the DApp's back-end logic is executed inside a Cartesi Machine, meaning that its code is cross-compiled to the machine's RISC-V architecture. This ensures that the computation performed by the back-end is _reproducible_ and hence _verifiable_, enabling a truly trustless and decentralized execution.

After building an example as described in the previous section, you can run it in production mode by executing:

```shell
cd <example>
docker compose -f ../docker-compose.yml -f ./docker-compose.override.yml up
```

Allow some time for the infrastructure to be ready.
How much will depend on your system, but after some time showing the error `"concurrent call in session"`, eventually the container logs will repeatedly show the following:

```shell
rollups-examples-server_manager_1      | Received GetVersion
rollups-examples-server_manager_1      | Received GetStatus
rollups-examples-server_manager_1      |   default_rollups_id
rollups-examples-server_manager_1      | Received GetSessionStatus for session default_rollups_id
rollups-examples-server_manager_1      |   0
rollups-examples-server_manager_1      | Received GetEpochStatus for session default_rollups_id epoch 0
```

The environment can be shut down with the following command:

```shell
docker-compose -f ../docker-compose.yml -f ./docker-compose.override.yml down -v
```

### Host mode

The _Cartesi Rollups Host Environment_ provides the very same HTTP API as the regular one, mimicking the behavior of the actual layer-1 and layer-2 components. This way, the Cartesi Rollups infrastructure can make HTTP requests to a back-end that is running natively on localhost. This allows the developer to test and debug the back-end logic using familiar tools, such as an IDE.

The host environment can be executed with the following command:

```shell
docker compose -f ../docker-compose.yml -f ./docker-compose.override.yml -f ../docker-compose-host.yml up
```

_Note_: In production mode, rejected inputs are guaranteed to have no effect on the back-end, since in that case the Cartesi Machine is completely rolled back to its previous state. However, in host mode there is no such guarantee and it is possible for changes to persist, for instance if the DApp allows an invalid input to change a global variable or produce a database write before it is rejected.

_Note_: When running in host mode, localhost port `5004` will be used by default to allow the DApp's back-end to communicate with the Cartesi Rollups framework.

### Interactive console

It is possible to start an interactive console for the Cartesi Machine containing the application's back-end logic.
This allows you to experiment with the back-end's software stacks within its production environment, allowing you to evaluate performance and explore the most adequate technology choices for its implementation.

After the [Building](#building) step above is executed, a corresponding console Docker image is made available for that purpose. To run it and start your interactive console, type the following command:

```shell
docker run --rm -it cartesi/dapp:<example>-devel-console
```

The example's specific resources can generally be found within the `/mnt/dapp` directory.

To run the console as the `root` user, type the following command:

```shell
docker run --rm -it cartesi/dapp:<example>-devel-console run-machine-console.sh --run-as-root
```

### Advancing time

When executing an example, it is possible to advance time in order to simulate the passing of epochs. To do that, run:

```shell
curl --data '{"id":1337,"jsonrpc":"2.0","method":"evm_increaseTime","params":[864010]}' http://localhost:8545
```

## Using testnets

<!-- markdownlint-disable MD024 -->
### Interacting with deployed DApps

Several examples committed to this repository are already deployed to the Ethereum Goerli testnet: [echo-python](./echo-python/README.md), [echo-cpp](./echo-cpp/README.md), [echo-lua](./echo-lua/README.md), [echo-js](./echo-js/README.md), [echo-low-level](./echo-low-level/README.md), [sqlite](./sqlite/README.md) and [knn](./knn/README.md). In order to interact with them, you can simply use the [frontend-console](./frontend-console) tool mentioned before, but this time specifying a few connectivity configurations appropriate for the target network.

First of all, you will need to provide an account with some funds for submitting transactions. This can be accomplished by specifying a mnemonic string, and optionally an account index to use from that mnemonic.
There are a few ways to get free Goerli testnet funds using _token faucets_. Sometimes you will be required to [use social media accounts](https://goerli-faucet.mudit.blog/) to request tokens, but in other cases you can just [directly specify an account address](https://goerli-faucet.slock.it/). Do keep in mind that individual faucets are kept by third-parties, are not guaranteed to be functioning at all times, and may be discontinued.

Aside from the account to use, submitting transactions also requires you to provide the URL of an appropriate RPC gateway node for the target network. There are many options for that, and several services provide private nodes with free tiers that are more than enough for running these examples. Some options include [Alchemy](https://www.alchemy.com/), [Infura](https://infura.io/) and [Moralis](https://moralis.io/).

Finally, to query the layer-2 Cartesi Node for DApp outputs, you will need to specify the URL of its GraphQL endpoint. As a general rule, the examples deployed to Goerli have their endpoints available at `https://<example>.goerli.rollups.staging.cartesi.io/graphql`.
As such, the Echo Python DApp has its endpoint available at `https://echo-python.goerli.rollups.staging.cartesi.io/graphql`. Please refer to the [frontend-console](./frontend-console)'s documentation for details on how to use it to [send inputs](./frontend-console/README.md#sending-inputs), [list outputs](./frontend-console/README.md#listing-notices-vouchers-and-reports), [deposit tokens](./frontend-console/README.md#depositing-erc-20-tokens), and more.

### Deploying DApps

Deploying a new Cartesi DApp to a blockchain requires creating a smart contract on that network, as well as running a validator node for the DApp.

The first step is to build the DApp's back-end machine, which will produce a hash that serves as a unique identifier.

```shell
cd <example>
docker buildx bake machine --load
```

Once the machine docker image is ready, we can use it to deploy a corresponding Rollups smart contract. This requires you to define a few environment variables to specify which network you are deploying to, which account to use, and which RPC gateway to use when submitting the deploy transaction.

```shell
export NETWORK=<network>
export MNEMONIC=<user sequence of twelve words>
export RPC_URL=<https://your.rpc.gateway>
```

For example, to deploy to the Goerli testnet using an Alchemy RPC node, you could execute:

```shell
export NETWORK=goerli
export MNEMONIC=<user sequence of twelve words>
export RPC_URL=https://eth-goerli.alchemyapi.io/v2/<USER_KEY>
```

With that in place, you can submit a deploy transaction to the Cartesi DApp Factory contract on the target network by executing the following command:

```shell
DAPP_NAME=<example> docker compose -f ../deploy-testnet.yml up
```

This will create a file at `../deployments/<network>/<example>.address` with the deployed contract's address.
Once the command finishes, it is advisable to stop the docker compose and remove the volumes created when executing it.

```shell
DAPP_NAME=<example> docker compose -f ../deploy-testnet.yml down -v
```

After that, a corresponding Cartesi Validator Node must also be instantiated in order to interact with the deployed smart contract on the target network and handle the back-end logic of the DApp.
Aside from the environment variables defined above, the node will also need a secure websocket endpoint for the RPC gateway (WSS URL) and the chain ID of the target network.

For example, for Goerli and Alchemy, you would set the following additional variables:

```shell
export WSS_URL=wss://eth-goerli.alchemyapi.io/v2/<USER_KEY>
export CHAIN_ID=5
```

Then, the node itself can be started by running a docker compose as follows:

```shell
DAPP_NAME=<example> docker compose -f ../docker-compose-testnet.yml -f ./docker-compose.override.yml up
```

Alternatively, you can also run the node on host mode by executing:

```shell
DAPP_NAME=<example> docker compose -f ../docker-compose-testnet.yml -f ./docker-compose.override.yml -f ../docker-compose-host-testnet.yml up
```

## Examples

### 1. [Echo Python DApp](./echo-python)

A basic "hello world" application, this DApp's back-end is written in Python and simply copies each input received as a corresponding output notice.

### 2. [Echo C++ DApp](./echo-cpp)

Implements the same behavior as the [Echo Python DApp](#1-echo-python-dapp) above, but with a back-end written in C++.

### 3. [Echo Rust DApp](./echo-rust)

Implements the same behavior as the [Echo Python DApp](#1-echo-python-dapp) above, but with a back-end written in Rust.

### 4. [Echo Lua DApp](./echo-lua)

Implements the same behavior as the [Echo Python DApp](#1-echo-python-dapp) above, but with a back-end written in Lua.

### 5. [Echo JS DApp](./echo-js)

Implements the same behavior as the [Echo Python DApp](#1-echo-python-dapp) above, but with a back-end written in JavaScript.

### 6. [Echo Low-Level DApp](./echo-low-level)

Implements the same behavior as the [Echo Python DApp](#1-echo-python-dapp) above, but with a back-end written in C++ using the low-level Cartesi Rollups API.

### 7. [Converter DApp](./converter)

An extension of the Echo DApp that handles complex input in the form of JSON strings, in order to perform transformations on text messages.

### 8. [Calculator DApp](./calculator)

The Calculator DApp is a simple mathematical expression evaluator that illustrates how to incorporate a pure Python dependency into an application.

### 9. [SQLite DApp](./sqlite)

Demonstrates how a DApp can easily leverage standard mainstream capabilities by building a minimalistic "decentralized SQL database" just by using the Cartesi Machine's built-in support for [SQLite](https://www.sqlite.org/index.html). This application will receive arbitrary SQL commands as input and execute them in an internal database, allowing users to insert data and query them later on. This example also highlights how errors should be handled, in the case of invalid SQL statements.

### 10. [k-NN DApp](./knn)

A Machine Learning Python application that implements the k-Nearest Neighbors supervised classification algorithm, and applies it to the classic Iris flower dataset.

### 11. [m2cgen DApp](./m2cgen)

A more generic Machine Learning DApp that illustrates how to use the [m2cgen (Model to Code Generator)](https://github.com/BayesWitnesses/m2cgen) library to easily leverage widely used Python ML tools such as [scikit-learn](https://scikit-learn.org/), [NumPy](https://numpy.org/) and [pandas](https://pandas.pydata.org/).

### 12. [ERC-20 DApp](./erc20)

Demonstrates how to handle ERC-20 deposits and withdrawals.
The application parses ERC-20 deposits received from the Portal and emits a notice confirming receipt.
It then issues corresponding vouchers to return the assets back to the depositor.

### 13. [Auction DApp](./auction)

Demonstrates how to create simple auctions for NFTs.
The application comes with an integrated wallet and is capable of handling deposits, transfers and withdrawals for ERC-20 and ERC-721 tokens.
It also implements a simple auction engine, which is responsible for creating auctions and handling bids, as well as transferring the auctioned NFTs to the winning bidder when the auction ends.
It exercises the Rollups API, showing how to process advance and inspect requests, as well as how to generate Notices, Vouchers, and Reports.

# Cartesi Rollups Examples

This repository includes examples of decentralized applications implemented using [Cartesi Rollups](https://github.com/cartesi/rollups).

You can use [Gitpod](https://www.gitpod.io/) to immediately open this repository within a working development environment with all [required dependencies](https://cartesi.io/docs/build-dapps/requirements) already installed.

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

This will also build the example's Cartesi Machine containing the DApp's back-end logic. For certain examples, this may include special [procedures for downloading and installing additional dependencies](./calculator/README.md#installing-extra-dependencies) required by the application.

## Running

Each application can be executed in 2 modes, as explained below.

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

_Note_: When running in host mode, localhost ports `5003` and `5004` will be used by default for the communication between the Cartesi Rollups framework and the DApp's back-end.

### Advancing time

When executing an example, it is possible to advance time in order to simulate the passing of epochs. To do that, run:

```shell
docker run cartesi/dapp-<example>-hardhat npx hardhat --network localhost util:advanceTime --seconds 864010
```

## Polygon Mumbai

### Running

Each example committed to the repository is also already deployed on the Polygon Mumbai testnet. In order to interact with them, you can simply use the same [frontend-console](./frontend-console) tool, but specifying the `polygon-mumbai` network.

The connectivity to Polygon Mumbai testnet relies on Infura. To use it, you need to create an Infura account with Polygon Mumbai enabled, and then take note of the `PROJECT_ID` of one of the account projects.

In order to send inputs, you will also need to provide an appropriate `MNEMONIC` for an account with enough MATIC funds to pay for the transaction fees. Please refer to Polygon's documentation on how to [get free testnet tokens](https://docs.polygon.technology/docs/develop/tools/polygon-faucet/).

### Deploying

Deploying a new Cartesi DApp to a blockchain requires creating a smart contract there, as well as running a validator node for the DApp.

To perform this operation, first of all the DApp must be built by following the instructions in the previous section. After that, the user should have a locally built docker image called `cartesi/dapp-<example>-hardhat`. This image contains the Cartesi Machine inside, as well as the necessary application and connectivity configuration to deploy the smart contract to remote networks. It should be noted that the smart contract deployment depends on the hash of the Cartesi Machine of the application, which is why the build procedure must be done beforehand.

With that in place, you can submit a deploy transaction to the Cartesi DApp Factory contract on the target network by executing the following command:

```shell
cd <example>
docker run -v $PWD/../deploy/:/deploy -e PROJECT_ID=<PROJECT_ID> -e MNEMONIC="<MNEMONIC>" cartesi/dapp-<example>-hardhat deploy --network polygon_mumbai --export /deploy/polygon_mumbai/<example>.json
```

This will create a file at `../deploy/polygon_mumbai/<example>.json` with the deployment information.

After that, a corresponding Cartesi Validator Node must also be instantiated in order to interact with the deployed smart contract on the target network and handle the back-end logic of the DApp. This is achieved by running a Docker Compose as such:

```shell
TODO
```

## Examples

### 1. [Echo Python DApp](./echo-python)

A basic "hello world" application, this DApp's back-end is written in Python and simply copies each input received as a corresponding output notice.

### 2. [Echo C++ DApp](./echo-cpp)

Implements the same behavior as the [Echo Python DApp](#1-echo-python-dapp) above, but with a back-end written in C++.

### 3. [Echo Rust DApp](./echo-rust)

Implements the same behavior as the [Echo Python DApp](#1-echo-python-dapp) above, but with a back-end written in Rust.

### 4. [Converter DApp](./converter)

An extension of the Echo DApp that handles complex input in the form of JSON strings, in order to perform transformations on text messages.

### 5. [Calculator DApp](./calculator)

The Calculator DApp is a simple mathematical expression evaluator that illustrates how to incorporate a pure Python dependency into an application.

### 6. [SQLite DApp](./sqlite)

Demonstrates how a DApp can easily leverage standard mainstream capabilities by building a minimalistic "decentralized SQL database" just by using the Cartesi Machine's built-in support for [SQLite](https://www.sqlite.org/index.html). This application will receive arbitrary SQL commands as input and execute them in an internal database, allowing users to insert data and query them later on. This example also highlights how errors should be handled, in the case of invalid SQL statements.

### 7. [k-NN DApp](./knn)

A Machine Learning Python application that implements the k-Nearest Neighbors supervised classification algorithm, and applies it to the classic Iris flower dataset.

### 8. [m2cgen DApp](./m2cgen)

A more generic Machine Learning DApp that illustrates how to use the [m2cgen (Model to Code Generator)](https://github.com/BayesWitnesses/m2cgen) library to easily leverage widely used Python ML tools such as [scikit-learn](https://scikit-learn.org/), [NumPy](https://numpy.org/) and [pandas](https://pandas.pydata.org/).

### 9. [ERC-20 Deposit](./erc20deposit)

Demonstrates how to parse ERC-20 deposits sent from the Portal.

# Cartesi Rollups Examples

This repository includes examples of decentralized applications implemented using [Cartesi Rollups](https://github.com/cartesi/rollups).

You can use [Gitpod](https://www.gitpod.io/) to immediately open this repository within a working development environment with all [required dependencies](https://cartesi.io/docs/build-dapps/requirements) already installed.

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#prebuild/https://github.com/cartesi/rollups-examples/)

## Introduction

From a developer’s point of view, each decentralized application or _DApp_ is composed of two main parts: a **front-end** and a **back-end**.

The **front-end** corresponds to the user-facing interface, which for these examples will often correspond to a command-line interface in the form of Hardhat tasks.

On the other hand, the **back-end** contains the business logic of the application, similar to what traditional systems would run inside a server. Its basic goal is to store and update the application state as user input is received, producing corresponding outputs. These outputs can come in the form of **vouchers** (transactions that can be carried out on Layer-1, such as a transfer of assets) and **notices** (informational statements, such as the resulting score of a game).

When compared to traditional software development, the main difference of a Cartesi DApp is that the back-end is deployed to a decentralized network of Layer-2 nodes, who continuously verify the correctness of all processing results. As a consequence, the front-end and back-end do not communicate directly with each other. Rather, the front-end sends inputs to the Cartesi Rollups framework, who in turn makes them available to the back-end instances running inside each node. After the inputs are processed by the back-end logic, the corresponding outputs are then informed back to the Rollups framework, which enforces their correctness and makes them available to the front-end and any other interested parties.

## HTTP API

As discussed above, the front-end and back-end parts of a Cartesi DApp communicate with each other through the Rollups framework.
This is accomplished in practice by using a set of HTTP interfaces, which are specified in [Cartesi's OpenAPI Interfaces repository](https://github.com/cartesi/openapi-interfaces/).

### Back-end

The DApp's back-end interacts with the Cartesi Rollups framework by retrieving processing requests and then submitting corresponding outputs.

### Front-end

The front-end part of the DApp needs to access the Cartesi Rollups framework to submit user inputs and retrieve the corresponding vouchers and notices produced by the back-end.

In practice, the examples presented here will usually perform these actions using Hardhat tasks already provided by the Rollups framework.

## Building and running

In general, each application can be executed in 2 modes, as explained below.

### Production mode

In this mode, the DApp's back-end logic is cross-compiled to the RISC-V architecture and executed inside a Cartesi Machine. This ensures that the computation performed by the back-end is _reproducible_ and hence _verifiable_, enabling a truly trustless and decentralized execution.

In order to build and execute any example perform the following commands:

```
$ cd <example>
$ docker buildx bake --load
$ docker compose -p <example> -f ../docker-compose.yml -f ./docker-compose.override.yml up
```

This will build some docker images, including the Cartesi Machine with the application, and run some containers.
The environment can be shutdown with the following command:

```
$ docker compose -p <example> down -v
```

### Host mode

The _Cartesi Rollups Host Environment_ provides the very same HTTP API as the regular one, mimicking the behavior of the actual Layer-1 and Layer-2 components. This way, the Cartesi Rollups infrastructure can make HTTP requests to a back-end that is running natively on localhost. This allows the developer to test and debug the back-end logic using familiar tools, such as an IDE.

_Note_: when running in host mode, localhost ports `5003` and `5004` will be used by default for the communication between the Cartesi Rollups framework and the DApp's back-end.

## Polygon Mumbai

### Deploying

Each example must have a corresponding smart contract deployed to the blockchain. When running locally a private network is provided by hardhat. When it's time to deploy to a public testnet this project provides connectivity configuration to some testnets.

The connectivity to Polygon Mumbai testnet relies on Infura. So the deployer needs to create an Infura account with Polygon Mumbai enabled, and take a note of the `PROJECT_ID` of one of the account projects.

The deployer also needs an account with enough MATIC funds to pay for the deployment transactions fees. Refer to Polygon documentation on how to [get free testnet tokens](https://docs.polygon.technology/docs/develop/tools/polygon-faucet/). Have in hand the `MNEMONIC` of the account that will be used to deploy.

The smart contract has some configuration options, and it also depends on the hash of the Cartesi Machine of the application. So the first step is to build the Cartesi Machine by following the instructions in the previous sections. After that step the user should have a docker image built locally named `cartesi/dapp-<example>-hardhat`. This images contains the Cartesi Machine inside, as well as the necessary application to deploy the smart contract.

The deployment can be executed with the following command:

```shell
$ cd <example>
$ docker run -v $PWD/../deploy/:/deploy -e PROJECT_ID=<PROJECT_ID> -e MNEMONIC="<MNEMONIC>" cartesi/dapp-<example>-hardhat deploy --network polygon_mumbai --export /deploy/polygon_mumbai/<example>.json
```

This will create a file at `../deploy/polygon_mumbai/<example>.json` with the deployment information.

## Examples

### 1. [Echo Python DApp](./echo-python)

A basic "hello world" application, this DApp's back-end is written in Python and simply copies each input received as a corresponding output notice.

### 2. [Echo C++ DApp](./echo-cpp)

Implements the same behavior as the [Echo DApp](#1-echo-dapp) above, but with a back-end written in C++.

### 3. [Converter DApp](./converter)

An extension of the Echo DApp that handles complex input in the form of JSON strings, in order to perform transformations on text messages.

### 4. [Calculator DApp](./calculator)

The Calculator DApp is a simple mathematical expression evaluator that illustrates how to incorporate a pure Python dependency into an application.

### 5. [SQLite DApp](./sqlite)

Demonstrates how a DApp can easily leverage standard mainstream capabilities by building a minimalistic "decentralized SQL database" just by using the Cartesi Machine's built-in support for [SQLite](https://www.sqlite.org/index.html). This application will receive arbitrary SQL commands as input and execute them in an internal database, allowing users to insert data and query them later on. This example also highlights how errors should be handled, in the case of invalid SQL statements.

### 6. [k-NN DApp](./knn)

A Machine Learning Python application that implements the k-Nearest Neighbors supervised classification algorithm, and applies it to the classic Iris flower dataset.

### 7. [m2cgen DApp](./m2cgen)

A more generic Machine Learning DApp that illustrates how to use the [m2cgen (Model to Code Generator)](https://github.com/BayesWitnesses/m2cgen) library to easily leverage widely used Python ML tools such as [scikit-learn](https://scikit-learn.org/), [NumPy](https://numpy.org/) and [pandas](https://pandas.pydata.org/).

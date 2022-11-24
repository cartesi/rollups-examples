# Echo DApp Front-end

This project is a simple example on how to implement a Cartesi DApp front-end.
It is a specific client for the "Echo" applications of the Rollups Examples repo, and is intended to work using any of the `echo-xxx` projects as the back-end.

It is implemented as a regular ReactJS application, using [ethers](https://docs.ethers.io/) and [apollo](https://www.apollographql.com/docs/react/) as its main dependencies.

It interacts with the DApp in two ways:

- Sends inputs to the DApp ([`RoarForm` component](#send-an-input-the-roar-component))
- Queries the DApp for results ([`Echoes` component](#query-outputs-the-echoes-component))

This version is currently restricted to `echo-xxx` DApps running on localhost using the local Hardhat chain and default test wallet.

## Building

Simply execute the following command from the project's directory:

```shell
yarn
```

## Running

First of all, you should run an `echo-xxx` back-end in your local environment. It could be [echo-python](../echo-python/), [echo-js](../echo-python/), or any other such example.

With an Echo DApp running, open a separate terminal in this project's directory, and run:

```shell
yarn start
```

This will execute the front-end application in development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

## How it works

### Send an Input: the Roar Component

This component presents a Form that captures a string entered by the user, and then sends it as an Input to the Echo DApp.
This component uses [ethers](https://docs.ethers.io/) to interact with the Cartesi Rollups through the blockchain. It follows these simple steps:

- Connects to the blockchain using a provider
- Creates a wallet instance connected to the provider so we can send signed transactions
- Creates a Cartesi `InputFacet` contract instance for the DApp
- Sends an `addInput` transaction using the `InputFacet` contract

#### Connect to the blockchain

In order to send inputs to the DApp, the first step is to connect to the blockchain on which it is deployed.
In this case, we are using ethers' `JsonRpcProvider` to connect to the local Hardhat instance, as follows:

```js
import { JsonRpcProvider } from "@ethersproject/providers";
...
const HARDHAT_LOCALHOST_RPC_URL = "http://localhost:8545";
const provider = new JsonRpcProvider(HARDHAT_LOCALHOST_RPC_URL);
```

#### Create a wallet instance

Now we use ethers to instantiate a Wallet. In this case we are using Hardhat's default test mneumonic:

```js
import { ethers } from "ethers";
...
const HARDHAT_DEFAULT_MNEMONIC =
  "test test test test test test test test test test test junk";

const signer = ethers.Wallet.fromMnemonic(
        HARDHAT_DEFAULT_MNEMONIC,
        `m/44'/60'/0'/0/0`
      ).connect(provider);
```

#### Create an InputFacet contract instance

To be able to actually send inputs, we need to instantiate an `InputFacet` contract using ethers. Here we use the Cartesi Rollups `InputFacet__factory` with the `LOCALHOST_DAPP_ADDRESS`, which is the default Cartesi DApp Address for local deployments.

```js
import {InputFacet__factory} from "@cartesi/rollups";
...
const LOCALHOST_DAPP_ADDRESS = "0xF8C694fd58360De278d5fF2276B7130Bfdc0192A"
const inputContract = InputFacet__factory.connect(LOCALHOST_DAPP_ADDRESS, signer)
```

#### Send a transaction to add an Input

Finally, we can send an `addInput` transaction and then check its result.

```js
const inputBytes = ethers.utils.isBytesLike(value)
        ? value
        : ethers.utils.toUtf8Bytes(value);
const tx = await inputContract.addInput(inputBytes);
const receipt = await tx.wait(1);
const event = receipt.events?.find((e) => e.event === "InputAdded");
console.log(`Input added => epoch : ${event?.args.epochNumber} index: ${event?.args.inputIndex} `)
```

### Query Outputs: the Echoes Component

This component uses [apollo](https://www.apollographql.com/docs/react/) to interact with the Rollups Query Server.

As the Echo DApps back-end replicates the given inputs as notices, we will be querying only for these.

To accomplish that this React App does the following:

- Configures an Apollo client
- Sets up the GraphQL query
- Checks query results

#### Configure Apollo client

Apollo requires us to configure a client, which we do in the `index.js` file as follows:

```js
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';
...
// Setup GraphQL Apollo client 
const URL_QUERY_GRAPHQL = "http://localhost:4000/graphql";

const client = new ApolloClient({
  uri: URL_QUERY_GRAPHQL,
  cache: new InMemoryCache(),
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(

  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>

);
```

#### Setup GraphQL query

At the `Echoes Component` we will actually query for the `Notices`. You can check the entire schema accessing the `Query Server` with a browser at [http://localhost:4000/graphql](http://localhost:4000/graphql)

Below we define the GraphQL query, and then use Apollo's `useQuery` function so that the server is polled every 500ms:

```js
import { useQuery, gql } from '@apollo/client';
import React, { useState, useEffect } from 'react';

// GraphQL query to retrieve notices given a cursor
const GET_NOTICES = gql`
  query GetNotices($cursor: String) {
    notices (first: 10, after: $cursor) {
      totalCount
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes{
        id
        payload
        index
        input{
            index
            epoch{
                index
            }
        }
      }
    }
  }
`;
...
function EchoesList() {
  const [cursor, setCursor] = useState(null);
  ...
  // Retrieve notices every 500 ms
  const { loading, error, data } = useQuery(GET_NOTICES, {
        variables: { cursor },
        pollInterval: 500
  });
}
```

#### Check query results

The Apollo client itself takes care of the polling, so that here we can just check for the results.

```js
function EchoesList {
  ...
  // Check query result
  const length = data?.notices?.nodes?.length;
  if (length) {
      // Update cursor so that next GraphQL poll retrieves only newer data
      setCursor(data.notices.pageInfo.endCursor);
  }
  ...
  // Render results
  data?.notices?.nodes?.map((node) => {
        // Render echo from notice
        const echo = ethers.utils.toUtf8String(node.payload);
        ...
  })
}
```

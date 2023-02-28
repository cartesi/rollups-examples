# Integration Tests

The integration tests are a set of tests meant to be executed on top of the Rollups Examples DApps. They use the [Frontend Console](../frontend-console/README.md) to interact with the DApps.

The tests are written in Typescript and are based on frameworks [Mocha](https://mochajs.org/) and [Chai](https://www.chaijs.com/api/).

## Run

To run tests on a DApp in `prod` mode, type the following command:

```shell
yarn test:prod DAPP_NAME
```

Or, to run tests on a DApp in `host` mode, type the following command:

```shell
yarn test:host DAPP_NAME
```

Where `DAPP_NAME` is the name of the sub-directory where the tests for the specific DApp live.

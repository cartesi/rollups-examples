# Template DApp

This simple template is aimed at providing a quick start for creating Cartesi Rollups DApps.

## Setting up the environment

First of all, clone the repository as follows:

```shell
git clone https://github.com/cartesi/rollups-examples.git
```

## Customizing the DApp

Then, use `create-dapp.sh` to create a customized DApp:

```shell
cd custom-dapps
./create-dapp.sh <dapp-name>
```

A new directory, `<dapp-name>`, will be created with all the boiler plate infrastructure needed by the new DApp.

The new DApp will be provided with some basic back-end code, resembling what is available in the sample [Echo Python DApp](https://github.com/cartesi/rollups-examples/tree/main/echo-python).

For instructions about how to setup the environment and run the original DApp, please refer to the [Template documentation](./template/README.md).

## Modifying the DApp logic

The back-end logic may be found at `<dapp-name>/<dapp-name>.py`.

The script comes with some reference code, which may be helpful during development.
It may be replaced or extended according to the use case needs.

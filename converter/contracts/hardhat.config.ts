// Copyright 2022 Cartesi Pte. Ltd.

// Licensed under the Apache License, Version 2.0 (the "License"); you may not
// use this file except in compliance with the License. You may obtain a copy
// of the license at http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
// WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
// License for the specific language governing permissions and limitations
// under the License.

import { HardhatUserConfig } from "hardhat/config";
import { HttpNetworkUserConfig } from "hardhat/types";

import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-etherscan";
import "@typechain/hardhat";
import "hardhat-deploy";
import "@cartesi/rollups";
import { appTasks, GraphQLConfig } from "@cartesi/rollups";

// get app name
import { name } from "./package.json";

// GraphQL endpoint configuration per network
const graphqlConfig: GraphQLConfig = {
    localhost: "http://localhost:4000/graphql"
}

// define app tasks that calls rollups tasks, resolving rollups contract address and GraphQL server address
// i.e. converter:addInput -> rollups:addInput
appTasks(name, graphqlConfig);

// read MNEMONIC from file or from env variable
let mnemonic = process.env.MNEMONIC;

const infuraNetwork = (
    network: string,
    chainId?: number,
    gas?: number
): HttpNetworkUserConfig => {
    return {
        url: `https://${network}.infura.io/v3/${process.env.PROJECT_ID}`,
        chainId,
        gas,
        accounts: mnemonic ? { mnemonic } : undefined,
    };
};

const config: HardhatUserConfig = {
    networks: {
        hardhat: mnemonic ? { accounts: { mnemonic } } : {},
        localhost: {
            url: "http://localhost:8545",
            accounts: mnemonic ? { mnemonic } : undefined,
        },
        ropsten: infuraNetwork("ropsten", 3, 6283185),
        rinkeby: infuraNetwork("rinkeby", 4, 6283185),
        kovan: infuraNetwork("kovan", 42, 6283185),
        goerli: infuraNetwork("goerli", 5, 6283185),
        mainnet: infuraNetwork("mainnet", 1, 6283185),
        polygon_mumbai: {
            url: "https://matic-mumbai.chainstacklabs.com",
            chainId: 80001,
            accounts: mnemonic ? { mnemonic } : undefined,
        },
        bsc_testnet: {
            url: "https://data-seed-prebsc-1-s1.binance.org:8545",
            chainId: 97,
            accounts: mnemonic ? { mnemonic } : undefined,
        },
    },
    external: {
        contracts: [
            {
                artifacts: "node_modules/@cartesi/util/export/artifacts",
                deploy: "node_modules/@cartesi/util/dist/deploy",
            },
            {
                artifacts: "node_modules/@cartesi/rollups/export/artifacts",
            },
        ],
        deployments: {
            localhost: ["node_modules/@cartesi/util/deployments/localhost"],
            mainnet: ["node_modules/@cartesi/util/deployments/mainnet"],
            ropsten: ["node_modules/@cartesi/util/deployments/ropsten"],
            rinkeby: ["node_modules/@cartesi/util/deployments/rinkeby"],
            kovan: ["node_modules/@cartesi/util/deployments/kovan"],
            goerli: ["node_modules/@cartesi/util/deployments/goerli"],
            polygon_mumbai: [
                "node_modules/@cartesi/util/deployments/matic_testnet",
            ],
            bsc_testnet: ["node_modules/@cartesi/util/deployments/bsc_testnet"],
        },
    },
    etherscan: {
        apiKey: {
            polygonMumbai: process.env.ETHERSCAN_API_KEY_POLYGON,
        },
    },
    verify: {
        etherscan: {
            apiKey: process.env.ETHERSCAN_API_KEY,
        },
    },
    namedAccounts: {
        deployer: {
            default: 0,
        },
    },
};

export default config;

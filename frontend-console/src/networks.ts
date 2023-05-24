// Copyright 2022 Cartesi Pte. Ltd.

// Licensed under the Apache License, Version 2.0 (the "License"); you may not use
// this file except in compliance with the License. You may obtain a copy of the
// License at http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software distributed
// under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
// CONDITIONS OF ANY KIND, either express or implied. See the License for the
// specific language governing permissions and limitations under the License.

export interface Chain {
    name: string;
    explorer?: string;
}

// compatible networks
export const networks: Record<number, Chain> = {
    31337: {
        name: "localhost",
    },
    5: {
        name: "goerli",
        explorer: "https://goerli.etherscan.io",
    },
    97: {
        name: "bsc_testnet",
        explorer: "https://testnet.bscscan.com",
    },
    43113: {
        name: "avax_fuji",
        explorer: "https://testnet.snowtrace.io",
    },
    80001: {
        name: "polygon_mumbai",
        explorer: "https://mumbai.polygonscan.com",
    },
    420: {
        name: "optimism_goerli",
        explorer: "https://goerli-optimism.etherscan.io",
    },
    421613: {
        name: "arbitrum_goerli",
        explorer: "https://goerli-rollup-explorer.arbitrum.io",
    },
    10200: {
        name: "chiado",
        explorer: "https://blockscout.chiadochain.net/",
    },
    11155111: {
        name: "sepolia",
        explorer: "https://sepolia.etherscan.io",
    },
};

// Copyright 2022 Cartesi Pte. Ltd.

// Licensed under the Apache License, Version 2.0 (the "License"); you may not use
// this file except in compliance with the License. You may obtain a copy of the
// License at http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software distributed
// under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
// CONDITIONS OF ANY KIND, either express or implied. See the License for the
// specific language governing permissions and limitations under the License.

export interface Chain {
    chainId: number;
    name: string;
    abi: string;
    rpc: string;
    explorer?: string;
    reader: string;
}

// compatible networks
export const networks: Chain[] = [
    {
        chainId: 31337,
        name: "localhost",
        abi: "../../contracts/export/abi/localhost.json",
        rpc: "http://localhost:8545",
        reader: "http://localhost:4000/graphql",
    },
    {
        chainId: 80001,
        name: "polygon_mumbai",
        abi: "../../contracts/export/abi/polygon_mumbai.json",
        rpc: "https://matic-mumbai.chainstacklabs.com",
        explorer: "https://mumbai.polygonscan.com",
        reader: "https://echo.rollups.dev.cartesi.io/graphql",
    },
];

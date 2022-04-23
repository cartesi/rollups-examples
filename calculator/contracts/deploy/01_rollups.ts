// Copyright 2022 Cartesi Pte. Ltd.

// Licensed under the Apache License, Version 2.0 (the "License"); you may not use
// this file except in compliance with the License. You may obtain a copy of the
// License at http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software distributed
// under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
// CONDITIONS OF ANY KIND, either express or implied. See the License for the
// specific language governing permissions and limitations under the License.

import fs from "fs";
import path from "path";
import { DeployFunction } from "hardhat-deploy/types";
import { cosmiconfig } from "cosmiconfig";
import { CreateArgs } from "@cartesi/hardhat-rollups";

const explorer = cosmiconfig("dapp");

/**
 * Returns the hash of a stored Cartesi Machine as hex string
 * @param directory directory containing a stored Cartesi Machine
 * @returns hash of the machine as hex string
 */
const hash = (directory: string): string => {
    const filename = path.join(directory, "hash");
    if (!fs.existsSync(filename)) {
        throw new Error(`file ${filename} not found`);
    }
    return "0x" + fs.readFileSync(filename).toString("hex");
};

const func: DeployFunction = async ({ network, run }) => {
    // search for DApp configuration, starting from 'config/{network}' and traversing up
    const configResult = await explorer.search(`config/${network.name}`);

    // bail out if we don't find a config
    if (!configResult || configResult.isEmpty) {
        throw new Error("dapp configuration not found");
    }

    console.log(`dapp configuration loaded from ${configResult.filepath}`);
    const config = configResult.config as CreateArgs;

    // read machine hash
    config.templateHash = hash("../machine");

    // deploy Rollups smart contracts
    console.log("deploying contracts with the following configuration:");
    console.log(config);
    await run("rollups:create", config);
};

export default func;

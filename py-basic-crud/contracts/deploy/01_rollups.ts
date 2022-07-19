// Copyright 2022 Cartesi Pte. Ltd.

// Licensed under the Apache License, Version 2.0 (the "License"); you may not use
// this file except in compliance with the License. You may obtain a copy of the
// License at http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software distributed
// under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
// CONDITIONS OF ANY KIND, either express or implied. See the License for the
// specific language governing permissions and limitations under the License.

import { DeployFunction } from "hardhat-deploy/types";
import { cosmiconfig } from "cosmiconfig";

const explorer = cosmiconfig("dapp");

const func: DeployFunction = async ({ network, run }) => {
    // search for DApp configuration, starting from 'config/{network}' and traversing up
    const configResult = await explorer.search(`config/${network.name}`);

    // bail out if we don't find a config
    if (!configResult || configResult.isEmpty) {
        throw new Error("dapp configuration not found");
    }

    console.log(`dapp configuration loaded from ${configResult.filepath}`);

    // deploy Rollups smart contracts
    await run("rollups:create", configResult.config);
};

export default func;

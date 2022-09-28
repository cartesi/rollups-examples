// Copyright 2022 Cartesi Pte. Ltd.

// Licensed under the Apache License, Version 2.0 (the "License"); you may not use
// this file except in compliance with the License. You may obtain a copy of the
// License at http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software distributed
// under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
// CONDITIONS OF ANY KIND, either express or implied. See the License for the
// specific language governing permissions and limitations under the License.

import {
    InputFacet,
    InputFacet__factory,
    OutputFacet,
    OutputFacet__factory,
    RollupsFacet,
    RollupsFacet__factory,
} from "@cartesi/rollups";
import { Web3Provider } from "@ethersproject/providers";
import { ConnectedChain } from "@web3-onboard/core";
import { ChainId } from "../../config/types";
import { env } from "../../config/constants";

export interface RollupsContracts {
    rollupsContract: RollupsFacet;
    inputContract: InputFacet;
    outputContract: OutputFacet;
}

export const addressMap: Record<ChainId, string> = {
    [ChainId.localhost]: env.VITE_LOCAL_DAPP_ADDRESS,
    [ChainId.testnet]: env.VITE_TESTNET_DAPP_ADDRESS,
};

export const genRollupsContracts = (
    chainId: ConnectedChain["id"],
    provider: Web3Provider
): RollupsContracts => {
    // TODO: get programatically instead of this hardcode
    const address = addressMap[chainId as ChainId];

    if (!address) {
        throw new Error("unable to resolve DApp address");
    }

    // connect to contracts
    const inputContract = InputFacet__factory.connect(
        address,
        provider.getSigner()
    );
    const outputContract = OutputFacet__factory.connect(
        address,
        provider.getSigner()
    );
    const rollupsContract = RollupsFacet__factory.connect(
        address,
        provider.getSigner()
    );

    return {
        inputContract,
        outputContract,
        rollupsContract,
    };
};

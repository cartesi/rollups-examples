// Copyright 2022 Cartesi Pte. Ltd.

// Licensed under the Apache License, Version 2.0 (the "License"); you may not use
// this file except in compliance with the License. You may obtain a copy of the
// License at http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software distributed
// under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
// CONDITIONS OF ANY KIND, either express or implied. See the License for the
// specific language governing permissions and limitations under the License.

import { JsonRpcProvider } from "@ethersproject/providers";
import { ethers } from "ethers";
import {
    InputFacet,
    InputFacet__factory,
    OutputFacet,
    OutputFacet__factory,
} from "@cartesi/rollups";
import { Chain, networks } from "./networks";

interface Contracts {
    chain: Chain;
    inputContract: InputFacet;
    outputContract: OutputFacet;
}

export const connect = async (
    chainName: string,
    address: string,
    mnemonic?: string
): Promise<Contracts> => {
    const chain = networks.find((n) => n.name === chainName);
    if (!chain) {
        throw new Error(`Unknown network: ${chainName}`);
    }
    // connect to JSON-RPC provider
    const provider = new JsonRpcProvider(chain.rpc);

    // create signer to be used to send transactions
    const signer = mnemonic
        ? ethers.Wallet.fromMnemonic(mnemonic).connect(provider)
        : new ethers.VoidSigner(address).connect(provider);

    // connect to contracts
    const inputContract = InputFacet__factory.connect(address, signer);
    const outputContract = OutputFacet__factory.connect(address, signer);
    return {
        chain,
        inputContract,
        outputContract,
    };
};

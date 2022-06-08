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
    ERC20PortalFacet,
    ERC20PortalFacet__factory,
} from "@cartesi/rollups";
import { Chain, networks } from "./networks";
import { Argv } from "yargs";

export interface Args {
    network: string;
    address?: string;
    addressFile?: string;
    mnemonic?: string;
    accountIndex: number;
}

interface Contracts {
    chain: Chain;
    inputContract: InputFacet;
    outputContract: OutputFacet;
    erc20Portal: ERC20PortalFacet;
}

export const builder = (
    yargs: Argv<{}>,
    transactional: boolean = false
): Argv<Args> => {
    return yargs
        .option("network", {
            describe: "Network",
            type: "string",
            choices: networks.map((n) => n.name),
            demandOption: true,
        })
        .option("mnemonic", {
            describe: "Wallet mnemonic",
            type: "string",
            demandOption: transactional, // required if need to send transactions
        })
        .option("accountIndex", {
            describe: "Account index from mnemonic",
            type: "number",
            default: 0,
        })
        .option("address", {
            describe: "Rollups contract address",
            type: "string",
        })
        .option("addressFile", {
            describe: "File with rollups contract address",
            type: "string",
        });
};

export const connect = async (
    chainName: string,
    address: string,
    mnemonic?: string,
    accountIndex?: number
): Promise<Contracts> => {
    const chain = networks.find((n) => n.name === chainName);
    if (!chain) {
        throw new Error(`Unknown network: ${chainName}`);
    }
    // connect to JSON-RPC provider
    const provider = new JsonRpcProvider(chain.rpc);

    // create signer to be used to send transactions
    const signer = mnemonic
        ? ethers.Wallet.fromMnemonic(
              mnemonic,
              `m/44'/60'/0'/0/${accountIndex ?? 0}`
          ).connect(provider)
        : undefined;

    // connect to contracts
    const inputContract = InputFacet__factory.connect(
        address,
        signer || provider
    );
    const outputContract = OutputFacet__factory.connect(
        address,
        signer || provider
    );
    const erc20Portal = ERC20PortalFacet__factory.connect(
        address,
        signer || provider
    );
    return {
        chain,
        inputContract,
        outputContract,
        erc20Portal,
    };
};

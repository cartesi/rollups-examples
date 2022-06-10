// Copyright 2022 Cartesi Pte. Ltd.

// Licensed under the Apache License, Version 2.0 (the "License"); you may not use
// this file except in compliance with the License. You may obtain a copy of the
// License at http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software distributed
// under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
// CONDITIONS OF ANY KIND, either express or implied. See the License for the
// specific language governing permissions and limitations under the License.

import fs from "fs";
import { Provider } from "@ethersproject/providers";
import { Signer } from "ethers";
import {
    InputFacet,
    InputFacet__factory,
    OutputFacet,
    OutputFacet__factory,
    ERC20PortalFacet,
    ERC20PortalFacet__factory,
} from "@cartesi/rollups";
import { Argv } from "yargs";
import { networks } from "./networks";

export interface Args {
    dapp: string;
    address?: string;
    addressFile?: string;
}

interface Contracts {
    inputContract: InputFacet;
    outputContract: OutputFacet;
    erc20Portal: ERC20PortalFacet;
}

/**
 * Builder for args for connecting to Rollups instance
 * @param yargs yargs instance
 * @returns Argv instance with all options
 */
export const builder = <T>(yargs: Argv<T>): Argv<Args & T> => {
    return yargs
        .option("dapp", {
            describe: "DApp name",
            type: "string",
            default: "dapp",
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

/**
 * Read address from text file
 * @param path Path of file with only address inside as string
 * @returns address or undefined if file does not exist
 */
const readFromFile = (path: string | undefined): string | undefined => {
    if (path && fs.existsSync(path)) {
        return fs.readFileSync(path, "utf8");
    }
};

/**
 * Read address from file located at deployment path
 * @param dapp DApp name
 * @param chainId number of chain id of connected network
 * @returns address or undefined if can't resolve network name of file does not exist
 */
const readDApp = (
    dapp: string | undefined,
    chainId: number
): string | undefined => {
    const network = networks[chainId];
    if (network && dapp) {
        return readFromFile(`../deployments/${network.name}/${dapp}.address`);
    }
};

/**
 * Connect to instance of Rollups application
 * @param chainId number of chain id of connected network
 * @param provider provider or signer of connected network
 * @param args args for connection logic
 * @returns Connected rollups contracts
 */
export const rollups = async (
    chainId: number,
    provider: Provider | Signer,
    args: Args
): Promise<Contracts> => {
    const address =
        args.address ||
        readFromFile(args.addressFile) ||
        readDApp(args.dapp, chainId);

    if (!address) {
        throw new Error("unable to resolve DApp address");
    }

    // connect to contracts
    const inputContract = InputFacet__factory.connect(address, provider);
    const outputContract = OutputFacet__factory.connect(address, provider);
    const erc20Portal = ERC20PortalFacet__factory.connect(address, provider);
    return {
        inputContract,
        outputContract,
        erc20Portal,
    };
};

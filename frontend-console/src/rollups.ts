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
    IInputBox,
    IInputBox__factory,
    CartesiDApp,
    CartesiDApp__factory,
    IERC20Portal,
    IERC20Portal__factory,
    IERC721Portal,
    IERC721Portal__factory,
} from "@cartesi/rollups";
import { Argv } from "yargs";
import { networks } from "./networks";
import { Deployment, Contract } from "./abi";
import {
    readAddressFromFile,
    readAllContractsFromDir
} from "./utils"

export interface Args {
    dapp: string;
    address?: string;
    addressFile?: string;
    deploymentFile?: string;
}

interface Contracts {
    dapp: string;
    inputContract: IInputBox;
    outputContract: CartesiDApp;
    erc20Portal: IERC20Portal;
    erc721Portal: IERC721Portal;
    deployment: Deployment

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
        })
        .option("deploymentFile", {
            describe: "JSON file with deployment of rollups contracts",
            type: "string",
        });
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
        return readAddressFromFile(`../deployments/${network.name}/${dapp}.json`);
    }
};


const readDeployment = (chainId: number, args: Args): Deployment => {
    if (args.deploymentFile) {
        const deployment = require(args.deploymentFile);
        if (!deployment) {
            throw new Error(
                `rollups deployment '${args.deploymentFile}' not found`
            );
        }
        return deployment as Deployment;
    } else {
        const network = networks[chainId];
        if (!network) {
            throw new Error(`unsupported chain ${chainId}`);
        }

        if (network.name === "localhost") {

            const contracts: Record<string, Contract> =
                readAllContractsFromDir("../deployments/localhost",
                    "../common-contracts/deployments/localhost");

            const deployment = { chainId: chainId.toString(), name: "localhost", contracts: contracts };
            return deployment as Deployment;
        }

        const deployment = require(`@cartesi/rollups/export/abi/${network.name}.json`);
        if (!deployment) {
            throw new Error(`rollups not deployed to network ${network.name}`);
        }
        return deployment as Deployment;
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
        readAddressFromFile(args.addressFile) ||
        readDApp(args.dapp, chainId);

    if (!address) {
        throw new Error("unable to resolve DApp address");
    }

    const deployment = readDeployment(chainId, args);
    const InputBox = deployment.contracts["InputBox"];
    const ERC20Portal = deployment.contracts["ERC20Portal"];
    const ERC721Portal = deployment.contracts["ERC721Portal"];

    // connect to contracts
    const inputContract = IInputBox__factory.connect(
        InputBox.address,
        provider
    );
    const outputContract = CartesiDApp__factory.connect(address, provider);
    const erc20Portal = IERC20Portal__factory.connect(
        ERC20Portal.address,
        provider
    );
    const erc721Portal = IERC721Portal__factory.connect(
        ERC721Portal.address,
        provider
    );


    return {
        dapp: address,
        inputContract,
        outputContract,
        erc20Portal,
        erc721Portal,
        deployment
    };
};

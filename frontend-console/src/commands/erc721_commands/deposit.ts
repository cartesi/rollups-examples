// Copyright 2022 Cartesi Pte. Ltd.

// Licensed under the Apache License, Version 2.0 (the "License"); you may not use
// this file except in compliance with the License. You may obtain a copy of the
// License at http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software distributed
// under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
// CONDITIONS OF ANY KIND, either express or implied. See the License for the
// specific language governing permissions and limitations under the License.

import { IERC721__factory } from "@cartesi/rollups";
import { Argv } from "yargs";
import {
    connect,
    Args as ConnectArgs,
    builder as connectBuilder,
} from "../../connect";
import {
    rollups,
    Args as RollupsArgs,
    builder as rollupsBuilder,
} from "../../rollups";
import { findInputAddedInfo } from "../util";
import { networks } from "../../networks";

interface Args extends ConnectArgs, RollupsArgs {
    erc721?: string;
    to: string;
    tokenId: string;
}

const safeTransferFrom = "safeTransferFrom(address,address,uint256)";

export const command = "deposit";
export const describe = "Deposit ERC-721 tokens to a DApp";

const tokenAddress = (chainId: number): string | undefined => {
    const network = networks[chainId];
    if (!network) {
        return; // undefined
    }

    try {
        if (network.name == "localhost") {
            return require("../../../../common-contracts/deployments/localhost/localhost_aux.json")
                .contracts.CartesiNFT.address;
        }
    } catch (e) {
        return; // undefined
    }
};

export const builder = (yargs: Argv<Args>) => {
    const connectArgs = connectBuilder(yargs, true);
    const rollupsArgs = rollupsBuilder(connectArgs);

    return rollupsArgs
        .option("erc721", {
            describe: "ERC-721 contract address",
            type: "string",
        })
        .option("tokenId", {
            demandOption: true,
            type: "string",
            describe: "The ID of the token being transfered",
        });
};

export const handler = async (args: Args) => {
    const { rpc, mnemonic, accountIndex, erc721, tokenId } = args;

    // connect to provider
    console.log(`connecting to ${rpc}`);
    const { provider, signer } = connect(rpc, mnemonic, accountIndex);

    const network = await provider.getNetwork();
    console.log(`connected to chain ${network.chainId}`);

    // connect to rollups
    const { inputContract, erc721Portal } = await rollups(
        network.chainId,
        signer || provider,
        args
    );

    console.log(`depositing token ${tokenId}...`);

    // get ERC-721 contract address
    const erc721address = erc721 ?? tokenAddress(network.chainId);
    if (!erc721address) {
        throw new Error(
            `cannot resolve ERC-721 address for chain ${network.chainId}`
        );
    }
    console.log(`using ERC-721 token contract at "${erc721address}"`);
    const erc721Contract = IERC721__factory.connect(
        erc721address,
        erc721Portal.signer
    );

    // send safeTransferFrom transaction
    const senderAddress = await erc721Portal.signer.getAddress();
    console.log(`using account "${senderAddress}"`);

    const tx = await erc721Contract[safeTransferFrom](
        senderAddress,
        erc721Portal.address,
        tokenId
    );
    console.log(`transaction: ${tx.hash}`);
    console.log("waiting for confirmation...");

    // print receipt info
    const receipt = await tx.wait();

    // find added input information from transaction receipt
    const inputAddedInfo = findInputAddedInfo(receipt, inputContract);
    console.log(
        `deposit successfully executed as input ${inputAddedInfo.input_index} of epoch ${inputAddedInfo.epoch_index}`
    );
};

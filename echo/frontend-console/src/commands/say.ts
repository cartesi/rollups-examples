// Copyright 2022 Cartesi Pte. Ltd.

// Licensed under the Apache License, Version 2.0 (the "License"); you may not use
// this file except in compliance with the License. You may obtain a copy of the
// License at http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software distributed
// under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
// CONDITIONS OF ANY KIND, either express or implied. See the License for the
// specific language governing permissions and limitations under the License.

import { ContractReceipt, ethers } from "ethers";
import prompts from "prompts";
import { Argv } from "yargs";
import { NoticeKeys } from "../../generated-src/graphql";
import { InputAddedEvent } from "../../generated-src/rollups/Input";
import { connect } from "../connect";
import { networks } from "../networks";

interface Args {
    network: string;
    mnemonic: string;
    message: string;
}

export const command = "say [message]";
export const describe = "Say something to echo DApp";

export const builder = (yargs: Argv) => {
    return yargs
        .option("network", {
            describe: "Network to use",
            type: "string",
            choices: networks.map((n) => n.name),
            demandOption: false,
        })
        .option("mnemonic", {
            describe: "Wallet mnemonic",
            type: "string",
            demandOption: false,
        })
        .positional("message", { demandOption: false, type: "string" });
};

/**
 * Translate a InputAddedEvent into a NoticeKeys
 * @param event Blockchain event of input added
 * @returns NoticeKeys to find notice in GraphQL server
 */
export const findNoticeKeys = (receipt: ContractReceipt): NoticeKeys => {
    // get InputAddedEvent from transaction receipt
    const event = receipt.events?.find((e) => e.event === "InputAdded");

    if (!event) {
        throw new Error(
            `InputAdded event not found in receipt of transaction ${receipt.transactionHash}`
        );
    }

    const inputAdded = event as InputAddedEvent;
    return {
        epoch_index: inputAdded.args._epochNumber.toString(),
        // XXX: input_index: event.args._inputIndex.toString(),
    };
};

export const handler = async (args: Args) => {
    // use provider from command line option, or ask the user
    const network =
        args.network ||
        (
            await prompts({
                type: "select",
                name: "network",
                choices: networks.map((n) => ({
                    title: n.name,
                    value: n.name,
                    description: n.rpc,
                })),
                message: "Select a network",
            })
        ).network;

    // use MNEMONIC from command line option, or get from environment variable MNEMONIC, or ask the user
    const mnemonic =
        args.mnemonic ||
        process.env.MNEMONIC ||
        (await (
            await prompts({
                type: "password",
                name: "mnemonic",
                message: "Enter your wallet mnemonic words",
            })
        ).mnemonic);

    // connect to provider, use deployment address based on returned chain id of provider
    console.log(`connecting to ${network}`);
    const { chain, inputContract } = await connect(network, mnemonic);

    // use message from command line option, or ask the user
    const message =
        args.message ||
        (
            await prompts({
                type: "text",
                name: "message",
                message: "Enter message to send",
            })
        ).message;
    console.log(`saying "${message}"`);

    // convert string to input bytes
    const input = ethers.utils.toUtf8Bytes(message);

    // send transaction
    const tx = await inputContract.addInput(input);
    console.log(`transaction: ${tx.hash}`);
    console.log("waiting for confirmation...");
    const receipt = await tx.wait(1);
    if (chain.explorer) {
        console.log(`${chain.explorer}/tx/${tx.hash}`);
    }

    // find reference to notice from transaction receipt
    const noticeKeys = findNoticeKeys(receipt);
    console.log(`input added to epoch ${noticeKeys.epoch_index}`);
};

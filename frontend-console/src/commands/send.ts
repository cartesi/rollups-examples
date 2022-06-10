// Copyright 2022 Cartesi Pte. Ltd.

// Licensed under the Apache License, Version 2.0 (the "License"); you may not use
// this file except in compliance with the License. You may obtain a copy of the
// License at http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software distributed
// under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
// CONDITIONS OF ANY KIND, either express or implied. See the License for the
// specific language governing permissions and limitations under the License.

import { InputAddedEvent } from "@cartesi/rollups/dist/src/types/contracts/interfaces/IInput";
import { ContractReceipt, ethers } from "ethers";
import { Argv } from "yargs";
import { NoticeKeys } from "../../generated-src/graphql";
import {
    connect,
    Args as ConnectArgs,
    builder as connectBuilder,
} from "../connect";
import {
    rollups,
    Args as RollupsArgs,
    builder as rollupsBuilder,
} from "../rollups";

interface Args extends ConnectArgs, RollupsArgs {
    message: string;
}

export const command = "send";
export const describe = "Send string input to DApp";

export const builder = (yargs: Argv<{}>): Argv<Args> => {
    // args regarding connecting to provider
    const connectArgs = connectBuilder(yargs, true);

    // args regarding connecting to rollups
    const rollupsArgs = rollupsBuilder(connectArgs);

    // this command args
    return rollupsArgs.option("message", {
        describe: "Message to send",
        type: "string",
        demandOption: true,
    });
};

/**
 * Translate a InputAddedEvent into a NoticeKeys
 * @param receipt Blockchain transaction receipt
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
        epoch_index: inputAdded.args.epochNumber.toString(),
        input_index: inputAdded.args.inputIndex.toString(),
    };
};

export const handler = async (args: Args) => {
    const { rpc, message, mnemonic, accountIndex } = args;

    // connect to provider
    console.log(`connecting to ${rpc}`);
    const { provider, signer } = connect(rpc, mnemonic, accountIndex);

    const network = await provider.getNetwork();
    console.log(`connected to chain ${network.chainId}`);

    // connect to rollups,
    const { inputContract } = await rollups(
        network.chainId,
        signer || provider,
        args
    );

    const signerAddress = await inputContract.signer.getAddress();
    console.log(`using account "${signerAddress}"`);

    // use message from command line option, or from user prompt
    console.log(`sending "${message}"`);

    // convert string to input bytes
    const input = ethers.utils.toUtf8Bytes(message);

    // send transaction
    const tx = await inputContract.addInput(input);
    console.log(`transaction: ${tx.hash}`);
    console.log("waiting for confirmation...");
    const receipt = await tx.wait(1);

    // find reference to notice from transaction receipt
    const noticeKeys = findNoticeKeys(receipt);
    console.log(
        `input ${noticeKeys.input_index} added to epoch ${noticeKeys.epoch_index}`
    );
};

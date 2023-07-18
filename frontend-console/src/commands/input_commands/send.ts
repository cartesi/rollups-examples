// Copyright 2022 Cartesi Pte. Ltd.

// Licensed under the Apache License, Version 2.0 (the "License"); you may not use
// this file except in compliance with the License. You may obtain a copy of the
// License at http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software distributed
// under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
// CONDITIONS OF ANY KIND, either express or implied. See the License for the
// specific language governing permissions and limitations under the License.

import { InputAddedEvent } from "@cartesi/rollups/dist/src/types/contracts/inputs/IInputBox";
import { ContractReceipt, ethers } from "ethers";
import { Argv } from "yargs";
import { InputKeys } from "../types";
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

interface Args extends ConnectArgs, RollupsArgs {
    payload: string;
}

export const command = "send";
export const describe = "Send string input to DApp";

export const builder = (yargs: Argv<{}>): Argv<Args> => {
    // args regarding connecting to provider
    const connectArgs = connectBuilder(yargs, true);

    // args regarding connecting to rollups
    const rollupsArgs = rollupsBuilder(connectArgs);

    // this command args
    return rollupsArgs.option("payload", {
        describe: "Input payload to send",
        type: "string",
        demandOption: true,
    });
};

/**
 * Retrieve InputKeys from an InputAddedEvent
 * @param receipt Blockchain transaction receipt
 * @returns input identification keys
 */
export const getInputKeys = (receipt: ContractReceipt): InputKeys => {
    // get InputAddedEvent from transaction receipt
    const event = receipt.events?.find((e) => e.event === "InputAdded");

    if (!event) {
        throw new Error(
            `InputAdded event not found in receipt of transaction ${receipt.transactionHash}`
        );
    }

    const inputAdded = event as InputAddedEvent;
    return {
        input_index: inputAdded.args.inputIndex.toNumber(),
    };
};

export const handler = async (args: Args) => {
    const { rpc, payload, mnemonic, accountIndex } = args;

    // connect to provider
    console.log(`connecting to ${rpc}`);
    const { provider, signer } = connect(rpc, mnemonic, accountIndex);

    const network = await provider.getNetwork();
    console.log(`connected to chain ${network.chainId}`);

    // connect to rollups,
    const { dapp, inputContract } = await rollups(
        network.chainId,
        signer || provider,
        args
    );

    const signerAddress = await inputContract.signer.getAddress();
    console.log(`using account "${signerAddress}"`);

    // use message from command line option, or from user prompt
    console.log(`sending "${payload}"`);

    // convert string to input bytes (if it's not already bytes-like)
    const inputBytes = ethers.utils.isBytesLike(payload)
        ? payload
        : ethers.utils.toUtf8Bytes(payload);

    // send transaction
    const tx = await inputContract.addInput(dapp, inputBytes);
    console.log(`transaction: ${tx.hash}`);
    console.log("waiting for confirmation...");
    const receipt = await tx.wait(1);

    // find reference to notice from transaction receipt
    const inputKeys = getInputKeys(receipt);
    console.log(`input ${inputKeys.input_index} added`);
};

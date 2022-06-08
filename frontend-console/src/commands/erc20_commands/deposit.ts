// Copyright 2022 Cartesi Pte. Ltd.

// Licensed under the Apache License, Version 2.0 (the "License"); you may not use
// this file except in compliance with the License. You may obtain a copy of the
// License at http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software distributed
// under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
// CONDITIONS OF ANY KIND, either express or implied. See the License for the
// specific language governing permissions and limitations under the License.

import { IERC20__factory, IInput } from "@cartesi/rollups";
import { ContractReceipt, ethers } from "ethers";
import prompts, { PromptObject } from "prompts";
import { Argv } from "yargs";
import { NoticeKeys } from "../../../generated-src/graphql";
import { connect } from "../../connect";
import { networks } from "../../networks";

interface Args {
    network: string;
    address: string;
    mnemonic: string;
    erc20: string;
    amount: string;
}

export const command = "deposit [amount]";
export const describe = "Deposit ERC-20 tokens in DApp";

const HARDHAT_DEFAULT_MNEMONIC =
    "test test test test test test test test test test test junk";

const tokenAddress = (network: string): string | undefined => {
    try {
        if (network == "localhost") {
            return require("../../../hardhat/deployments/localhost/CartesiToken.json")
                .address;
        } else if (network) {
            let ctsiDeploymentNetwork =
                network == "polygon_mumbai" ? "matic_testnet" : network;
            return require(`@cartesi/token/deployments/${ctsiDeploymentNetwork}/CartesiToken.json`)
                .address;
        }
    } catch (e) {
        return; // undefined
    }
};

export const builder = (yargs: Argv<Args>) => {
    // retrieves mnemonic implicit from either the environment or from the default value for localhost
    let mnemonic = process.env.MNEMONIC;
    const network = (<any>yargs.argv).network;
    if (!mnemonic && network == "localhost") {
        mnemonic = HARDHAT_DEFAULT_MNEMONIC;
    }

    // retrieves the address of the CTSI token for the configured network, to use as a default ERC-20 address
    const ctsiAddress = tokenAddress(network);

    return yargs
        .option("network", {
            describe: "Network to use",
            type: "string",
            choices: networks.map((n) => n.name),
            demandOption: false,
        })
        .option("address", {
            describe: "Rollups contract address",
            type: "string",
            demandOption: false,
        })
        .option("mnemonic", {
            describe: "Wallet mnemonic",
            type: "string",
            default: mnemonic,
            demandOption: false,
        })
        .option("erc20", {
            describe: "ERC-20 address",
            type: "string",
            default: ctsiAddress,
            demandOption: false,
        })
        .positional("amount", {
            demandOption: false,
            type: "string",
            describe: "Amount of ERC-20 tokens to deposit",
        });
};

/**
 * Validator for mnemonic value
 * @param value mnemonic words separated by space
 * @returns true if valid, false if invalid
 */
const mnemonicValidator = (value: string) => {
    try {
        ethers.Wallet.fromMnemonic(value);
        return true;
    } catch (e) {
        return "Invalid mnemonic";
    }
};

/**
 * Translate a InputAddedEvent into a NoticeKeys
 * @param receipt Blockchain transaction receipt
 * @returns NoticeKeys to find notice in GraphQL server
 */
export const findInputAddedInfo = (
    receipt: ContractReceipt,
    inputContract: IInput
): NoticeKeys => {
    if (receipt.events) {
        for (const event of receipt.events) {
            try {
                const parsedLog = inputContract.interface.parseLog(event);
                if (parsedLog.name == "InputAdded") {
                    return {
                        epoch_index: parsedLog.args.epochNumber.toString(),
                        input_index: parsedLog.args.inputIndex.toString(),
                    };
                }
            } catch (e) {
                // do nothing, just skip to try parsing the next event
            }
        }
    }
    throw new Error(
        `InputAdded event not found in receipt of transaction ${receipt.transactionHash}`
    );
};

export const handler = async (args: Args) => {
    // default values from args
    prompts.override(args);

    let promptsNetwork: string;
    const questions: PromptObject[] = [
        {
            type: "select",
            name: "network",
            choices: networks.map((n) => ({
                title: n.name,
                value: n.name,
                description: n.rpc,
            })),
            message: "Select a network",
        },
        {
            type: (network: string) =>
                network == "localhost" ? "text" : "password", // if localhost is selected, we can show as plain text
            name: "mnemonic",
            message: "Enter your wallet mnemonic words",
            validate: mnemonicValidator,
            initial: (network: string) => {
                promptsNetwork = network;
                return network == "localhost" ? HARDHAT_DEFAULT_MNEMONIC : ""; // if localhost is selected, suggest default mnemonic
            },
        },
        {
            type: "text",
            name: "address",
            message: "Rollups contract address",
        },
        {
            type: "text",
            name: "erc20",
            message: "ERC-20 address",
            initial: () => tokenAddress(promptsNetwork) || "",
        },
        {
            type: "text",
            name: "amount",
            message: "Amount of ERC-20 tokens to deposit",
        },
    ];
    const { network, address, mnemonic, erc20, amount } = await prompts<string>(
        questions
    );

    // connect to provider, use deployment address based on returned chain id of provider
    console.log(`using ERC-20 token contract at address "${erc20}"`);
    console.log(`connecting to ${network}`);
    const { chain, inputContract, erc20Portal } = await connect(
        network,
        address,
        mnemonic
    );

    const erc20Amount = ethers.BigNumber.from(amount);

    // increase erc20 allowance first if necessary
    const erc20Contract = IERC20__factory.connect(erc20, erc20Portal.signer);
    const signerAddress = await erc20Portal.signer.getAddress();
    console.log(`using account "${signerAddress}"`);
    const allowance = await erc20Contract.allowance(signerAddress, address);
    if (allowance.lt(erc20Amount)) {
        const allowanceApproveAmount =
            ethers.BigNumber.from(erc20Amount).sub(allowance);
        console.log(
            `approving allowance of ${allowanceApproveAmount} tokens...`
        );
        const tx = await erc20Contract.approve(address, allowanceApproveAmount);
        await tx.wait();
    }

    // send deposit transaction
    console.log(`depositing ${amount} tokens...`);
    const tx = await erc20Portal.erc20Deposit(erc20, erc20Amount, "0x");
    console.log(`transaction: ${tx.hash}`);
    console.log("waiting for confirmation...");
    const receipt = await tx.wait();
    if (chain.explorer) {
        console.log(`${chain.explorer}/tx/${tx.hash}`);
    }

    // find added input information from transaction receipt
    const inputAddedInfo = findInputAddedInfo(receipt, inputContract);
    console.log(
        `deposit successfully executed as input ${inputAddedInfo.input_index} of epoch ${inputAddedInfo.epoch_index}`
    );
};

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
import { Argv } from "yargs";
import { InputKeys } from "../types";
import { networks } from "../../networks";
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
    erc20?: string;
    amount: string;
}

export const command = "deposit";
export const describe = "Deposit ERC-20 tokens in DApp";

const tokenAddress = (chainId: number): string | undefined => {
    const network = networks[chainId];
    if (!network) {
        return; // undefined
    }

    try {
        if (network.name == "localhost") {
            return require("../../../../deployments/localhost/CartesiToken.json")
                .address;
        } else if (network) {
            return require(`@cartesi/token/deployments/${network.name}/CartesiToken.json`)
                .address;
        }
    } catch (e) {
        return; // undefined
    }
};

export const builder = (yargs: Argv<Args>) => {
    // args regarding connecting to provider
    const connectArgs = connectBuilder(yargs, true);

    // args regarding connecting to rollups
    const rollupsArgs = rollupsBuilder(connectArgs);

    // this command args
    return rollupsArgs
        .option("erc20", {
            describe: "ERC-20 address",
            type: "string",
        })
        .option("amount", {
            demandOption: true,
            type: "string",
            describe: "Amount of ERC-20 tokens to deposit",
        });
};

/**
 * Retrieve InputKeys from InputAddedEvent
 * @param receipt Blockchain transaction receipt
 * @returns input identification keys
 */
export const findInputAddedInfo = (
    receipt: ContractReceipt,
    inputContract: IInput
): InputKeys => {
    if (receipt.events) {
        for (const event of receipt.events) {
            try {
                const parsedLog = inputContract.interface.parseLog(event);
                if (parsedLog.name == "InputAdded") {
                    return {
                        epoch_index: parsedLog.args.epochNumber.toNumber(),
                        input_index: parsedLog.args.inputIndex.toNumber(),
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
    const { rpc, address, mnemonic, accountIndex, erc20, amount } = args;

    // connect to provider
    console.log(`connecting to ${rpc}`);
    const { provider, signer } = connect(rpc, mnemonic, accountIndex);

    const network = await provider.getNetwork();
    console.log(`connected to chain ${network.chainId}`);

    // connect to rollups,
    const { inputContract, erc20Portal } = await rollups(
        network.chainId,
        signer || provider,
        args
    );

    // connect to provider, use deployment address based on returned chain id of provider
    const erc20Address = erc20 ?? tokenAddress(network.chainId);
    if (!erc20Address) {
        throw new Error(
            `cannot resolve ERC-20 address for chain ${network.chainId}`
        );
    }
    console.log(`using ERC-20 token contract at address "${erc20Address}"`);

    const erc20Amount = ethers.BigNumber.from(amount);

    // increase erc20 allowance first if necessary
    const erc20Contract = IERC20__factory.connect(
        erc20Address,
        erc20Portal.signer
    );
    const signerAddress = await erc20Portal.signer.getAddress();
    console.log(`using account "${signerAddress}"`);
    const allowance = await erc20Contract.allowance(
        signerAddress,
        erc20Portal.address
    );
    if (allowance.lt(erc20Amount)) {
        const allowanceApproveAmount =
            ethers.BigNumber.from(erc20Amount).sub(allowance);
        console.log(
            `approving allowance of ${allowanceApproveAmount} tokens...`
        );
        const tx = await erc20Contract.approve(
            erc20Portal.address,
            allowanceApproveAmount
        );
        await tx.wait();
    }

    // send deposit transaction
    console.log(`depositing ${amount} tokens...`);
    const tx = await erc20Portal.erc20Deposit(erc20Address, erc20Amount, "0x");
    console.log(`transaction: ${tx.hash}`);
    console.log("waiting for confirmation...");
    const receipt = await tx.wait();

    // find added input information from transaction receipt
    const inputAddedInfo = findInputAddedInfo(receipt, inputContract);
    console.log(
        `deposit successfully executed as input ${inputAddedInfo.input_index} of epoch ${inputAddedInfo.epoch_index}`
    );
};

// Copyright 2022 Cartesi Pte. Ltd.

// Licensed under the Apache License, Version 2.0 (the "License"); you may not use
// this file except in compliance with the License. You may obtain a copy of the
// License at http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software distributed
// under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
// CONDITIONS OF ANY KIND, either express or implied. See the License for the
// specific language governing permissions and limitations under the License.

import { Argv } from "yargs";

import { getVoucher } from "../../graphql/vouchers";
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
import {
    LibOutputValidation__factory,
    History__factory,
} from "@cartesi/rollups";

interface Args extends ConnectArgs, RollupsArgs {
    url: string;
    index: number;
    input: number;
}

export const command = "execute";
export const describe = "Execute voucher given its input index and its index";

const DEFAULT_URL = "http://localhost:4000/graphql";

export const builder = (yargs: Argv) => {
    // args regarding connecting to provider
    const connectArgs = connectBuilder(yargs, true);

    // args regarding connecting to rollups
    const rollupsArgs = rollupsBuilder(connectArgs);

    // this command args
    return rollupsArgs
        .option("url", {
            describe: "Reader URL",
            type: "string",
            default: DEFAULT_URL,
        })
        .option("index", {
            describe: "Voucher index within its associated Input",
            type: "number",
            requiresArg: true,
        })
        .option("input", {
            describe: "Input index",
            type: "number",
            requiresArg: true,
        });
};

export const handler = async (args: Args) => {
    const { url, index, input, rpc, mnemonic, accountIndex } = args;

    // wait for vouchers to appear in reader
    console.log(
        `retrieving voucher "${index}" from input "${input}" along with proof`
    );
    const voucher = await getVoucher(url, index, input);
    if (!voucher.proof) {
        console.log(
            `voucher "${index}" from input "${input}" has no associated proof yet`
        );
        return;
    }

    // connect to provider
    console.log(`connecting to ${rpc}`);
    const { provider, signer } = connect(rpc, mnemonic, accountIndex);

    const network = await provider.getNetwork();
    console.log(`connected to chain ${network.chainId}`);

    // connect to rollups,
    const { outputContract } = await rollups(
        network.chainId,
        signer || provider,
        args
    );

    const signerAddress = await outputContract.signer.getAddress();
    console.log(`using account "${signerAddress}"`);

    // send transaction to validate voucher
    console.log(`executing voucher "${index}" from input "${input}"`);

    try {
        const tx = await outputContract.executeVoucher(
            voucher.destination,
            voucher.payload,
            voucher.proof
        );
        const receipt = await tx.wait();
        console.log(`voucher executed! (tx="${tx.hash}")`);
        if (receipt.events) {
            console.log(`resulting events: ${JSON.stringify(receipt.events)}`);
        }
    } catch (e) {
        let error: any = e;
        // if error is a custom revert object, we need to parse it given its "data" field
        // note: custom revert error declaration may be in one of several contracts
        const errorData = error?.error?.error?.error?.data;
        try {
            error = outputContract.interface.parseError(errorData).name;
        } catch (e) {
            try {
                const libOutputValidation =
                    LibOutputValidation__factory.connect(
                        outputContract.address,
                        outputContract.signer
                    );
                error =
                    libOutputValidation.interface.parseError(errorData).name;
            } catch (e) {
                try {
                    const history = History__factory.connect(
                        outputContract.address,
                        outputContract.signer
                    );
                    error = history.interface.parseError(errorData).name;
                } catch (e) {}
            }
        }
        console.log(`COULD NOT EXECUTE VOUCHER: ${JSON.stringify(error)}`);
    }
};

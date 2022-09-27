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
import { OutputValidityProofStruct } from "@cartesi/rollups/dist/src/types/contracts/interfaces/IOutput";

interface Args extends ConnectArgs, RollupsArgs {
    url: string;
    id: string;
}

export const command = "execute";
export const describe = "Execute voucher given its id";

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
        .option("id", {
            describe: "Voucher ID",
            type: "string",
            requiresArg: true,
        });
};

export const handler = async (args: Args) => {
    const { url, id, rpc, mnemonic, accountIndex } = args;

    // wait for vouchers to appear in reader
    console.log(`retrieving voucher "${id}" along with proof`);
    const voucher = await getVoucher(url, id);
    if (!voucher.proof) {
        console.log(`voucher "${id}" has no associated proof yet`);
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

    // send transaction to execute voucher
    console.log(`executing voucher "${id}"`);
    const proof: OutputValidityProofStruct = {
        ...voucher.proof,
        epochIndex: voucher.input.epoch.index,
        inputIndex: voucher.input.index,
        outputIndex: voucher.index,
    };
    try {
        // console.log(`Would check: ${JSON.stringify(proof)}`);
        const tx = await outputContract.executeVoucher(
            voucher.destination,
            voucher.payload,
            proof
        );
        const receipt = await tx.wait();
        console.log(`voucher executed! (tx="${tx.hash}")`);
        if (receipt.events) {
            console.log(`resulting events: ${JSON.stringify(receipt.events)}`);
        }
    } catch (e) {
        console.log(`COULD NOT EXECUTE VOUCHER: ${JSON.stringify(e)}`);
    }
};

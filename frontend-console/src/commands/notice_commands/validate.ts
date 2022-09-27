// Copyright 2022 Cartesi Pte. Ltd.

// Licensed under the Apache License, Version 2.0 (the "License"); you may not use
// this file except in compliance with the License. You may obtain a copy of the
// License at http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software distributed
// under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
// CONDITIONS OF ANY KIND, either express or implied. See the License for the
// specific language governing permissions and limitations under the License.

import { Argv } from "yargs";
import { getNotice } from "../../graphql/notices";
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

export const command = "validate";
export const describe = "Validate notice given its id";

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
            describe: "Notice ID",
            type: "string",
            requiresArg: true,
        });
};

export const handler = async (args: Args) => {
    const { url, id, rpc, mnemonic, accountIndex } = args;

    // wait for notices to appear in reader
    console.log(`retrieving notice "${id}" along with proof`);
    const notice = await getNotice(url, id);
    if (!notice.proof) {
        console.log(`notice "${id}" has no associated proof yet`);
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

    // send transaction to validate notice
    console.log(`validating notice "${id}"`);
    const proof: OutputValidityProofStruct = {
        ...notice.proof,
        epochIndex: notice.input.epoch.index,
        inputIndex: notice.input.index,
        outputIndex: notice.index,
    };
    try {
        // console.log(`Would check: ${JSON.stringify(proof)}`);
        const ret = await outputContract.validateNotice(notice.payload, proof);
        console.log(`notice is valid! (ret="${ret}")`);
    } catch (e) {
        console.log(`COULD NOT VALIDATE NOTICE: ${JSON.stringify(e)}`);
    }
};

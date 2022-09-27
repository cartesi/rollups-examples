// Copyright 2022 Cartesi Pte. Ltd.

// Licensed under the Apache License, Version 2.0 (the "License"); you may not use
// this file except in compliance with the License. You may obtain a copy of the
// License at http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software distributed
// under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
// CONDITIONS OF ANY KIND, either express or implied. See the License for the
// specific language governing permissions and limitations under the License.

import { Argv } from "yargs";
import { getNotices } from "../../graphql/notices";
import { ethers } from "ethers";
import { hex2str } from "../utils";

interface Args {
    url: string;
    epoch?: number;
    input?: number;
}

export const command = "list";
export const describe = "List notices of an epoch and input";

const DEFAULT_URL = "http://localhost:4000/graphql";

export const builder = (yargs: Argv) => {
    return yargs
        .option("url", {
            describe: "Reader URL",
            type: "string",
            default: DEFAULT_URL,
        })
        .option("epoch", {
            describe: "Epoch index",
            type: "number",
        })
        .option("input", {
            describe: "Input index",
            type: "number",
        });
};

export const handler = async (args: Args) => {
    const { url, epoch, input } = args;

    // wait for notices to appear in reader
    const notices = await getNotices(url, {
        epoch_index: epoch,
        input_index: input,
    });

    // gathers outputs to print based on the retrieved notices
    // - sorts notices because the query is not sortable
    // - decodes the hex payload as an UTF-8 string, if possible
    // - prints only payload and indices for epoch, input and notice
    const outputs = notices
        .sort((a, b) => {
            // sort by epoch index and then by input index
            const epochResult = a.input.epoch.index - b.input.epoch.index;
            if (epochResult != 0) {
                return epochResult;
            } else {
                return a.input.index - b.input.index;
            }
        })
        .map((n) => {
            const output: any = {};
            output.id = n.id;
            output.epoch = n.input.epoch.index;
            output.input = n.input.index;
            output.notice = n.index;
            output.payload = hex2str(n.payload);
            return output;
        });

    console.log(JSON.stringify(outputs));
};

// Copyright 2022 Cartesi Pte. Ltd.

// Licensed under the Apache License, Version 2.0 (the "License"); you may not use
// this file except in compliance with the License. You may obtain a copy of the
// License at http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software distributed
// under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
// CONDITIONS OF ANY KIND, either express or implied. See the License for the
// specific language governing permissions and limitations under the License.

import prompts from "prompts";
import { Argv } from "yargs";
import { getNotices } from "../graphql/notices";
import { ethers } from "ethers";

interface Args {
    url: string;
    epoch: number;
    input: number;
}

export const command = "notices";
export const describe = "List notices of an epoch and input";

const DEFAULT_URL = "http://localhost:4000/graphql";

export const builder = (yargs: Argv) => {
    return yargs
        .option("url", {
            describe: "Reader URL",
            type: "string",
            default: DEFAULT_URL,
            demandOption: false,
        })
        .option("epoch", {
            describe: "Epoch index",
            type: "number",
            demandOption: false,
        })
        .option("input", {
            describe: "Input index",
            type: "number",
            demandOption: false,
        });
};

export const handler = async (args: Args) => {
    // default values from args
    prompts.override(args);

    // use provider from command line option, or ask the user
    const url: string =
        args.url ||
        (
            await prompts({
                type: "text",
                name: "url",
                message: "Reader URL",
            })
        ).url;

    const epoch: number =
        args.epoch ||
        (await (
            await prompts({
                type: "number",
                name: "epoch",
                message: "Enter epoch number",
            })
        ).epoch);

    let input: number = args.input;
    if (input === undefined && args.epoch === undefined) {
        // only asks for input when neither itself nor the epoch has been defined in the args
        input = await (
            await prompts({
                type: "number",
                name: "input",
                message: "Enter input index",
            })
        ).input;
    }

    // connect to reader URL
    console.log(`connecting to ${url}`);

    // wait for notices to appear in reader
    const notices = await getNotices(url, {
        epoch_index: epoch.toString(),
        input_index: input?.toString(),
    });

    // we need to sort the notices because the query is not sortable
    // then decode the payload as byte string (with 0x prefix)
    const messages = notices
        .sort((a, b) => parseInt(a.input_index) - parseInt(b.input_index))
        .map((n) => ethers.utils.toUtf8String("0x" + n.payload));

    console.log(messages);
};

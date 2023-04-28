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
import { hex2str } from "../utils";

interface Args {
    url: string;
    input?: number;
}

export const command = "list";
export const describe = "List notices of an input";

const DEFAULT_URL = "http://localhost:4000/graphql";

export const builder = (yargs: Argv) => {
    return yargs
        .option("url", {
            describe: "Reader URL",
            type: "string",
            default: DEFAULT_URL,
        })
        .option("input", {
            describe: "Input index",
            type: "number",
        });
};

export const handler = async (args: Args) => {
    const { url, input } = args;

    // wait for notices to appear in reader
    const notices = await getNotices(url, input);

    // gathers outputs to print based on the retrieved notices
    // - sorts notices because the query is not sortable
    // - decodes the hex payload as an UTF-8 string, if possible
    // - prints only payload and indices for input and notice
    const outputs = notices
        .sort((a, b) => {
            // sort by input index and then by notice index
            const inputResult = a.input.index - b.input.index;
            if (inputResult != 0) {
                return inputResult;
            } else {
                return a.index - b.index;
            }
        })
        .map((n) => {
            const output: any = {};
            output.index = n.index;
            output.input = n.input.index;
            output.payload = hex2str(n.payload);
            return output;
        });

    console.log(JSON.stringify(outputs));
};

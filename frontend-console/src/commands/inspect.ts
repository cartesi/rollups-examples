// Copyright 2022 Cartesi Pte. Ltd.

// Licensed under the Apache License, Version 2.0 (the "License"); you may not use
// this file except in compliance with the License. You may obtain a copy of the
// License at http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software distributed
// under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
// CONDITIONS OF ANY KIND, either express or implied. See the License for the
// specific language governing permissions and limitations under the License.

import fetch from "cross-fetch";
import { ethers } from "ethers";
import path from "path";
import { Argv } from "yargs";

interface Args {
    payload: string;
    url: string;
}

export const command = "inspect";
export const describe = "Inspect the state of the DApp";

const DEFAULT_URL = "http://localhost:5005/inspect";

export const builder = (yargs: Argv) => {
    return yargs
        .option("url", {
            describe: "Reader inspect URL",
            type: "string",
            default: DEFAULT_URL,
        })
        .option("payload", {
            describe: "Inspect payload to send",
            type: "string",
            demandOption: true,
        });
};

export const handler = async (args: Args) => {
    const { url, payload } = args;

    const response = await fetch(path.join(url, payload));

    console.log(`HTTP status: ${response.status}`);
    if (response.status == 200) {
        const result = await response.json();
        console.log(`Inspect status: ${JSON.stringify(result.status)}`);
        console.log(`Metadata: ${JSON.stringify(result.metadata)}`);
        console.log(`Reports:`);
        for (let i in result.reports) {
            let output = result.reports[i].payload;
            try {
                output = ethers.utils.toUtf8String(output);
            } catch (e) {
                // cannot decode hex payload as a UTF-8 string
            }
            console.log(`${i}: ${output}`);
        }
        if (result.exception_payload) {
            let payload = result.exception_payload;
            try {
                payload = ethers.utils.toUtf8String(payload);
            } catch (e) {
                // cannot decode hex payload as a UTF-8 string
            }
            console.log(`Exception payload: ${payload}`);
        }
    } else {
        console.log(JSON.stringify(await response.text()));
    }
};

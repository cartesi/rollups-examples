// Copyright 2022 Cartesi Pte. Ltd.

// Licensed under the Apache License, Version 2.0 (the "License"); you may not use
// this file except in compliance with the License. You may obtain a copy of the
// License at http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software distributed
// under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
// CONDITIONS OF ANY KIND, either express or implied. See the License for the
// specific language governing permissions and limitations under the License.

import { createClient, defaultExchanges } from "@urql/core";
import fetch from "cross-fetch";
import {
    ReportsDocument,
    ReportsByEpochDocument,
    ReportsByEpochAndInputDocument,
    Report,
    Input,
    ReportDocument,
} from "../../generated-src/graphql";
import { InputKeys } from "../commands/types";

// define PartialReport type only with the desired fields of the full Report defined by the GraphQL schema
export type PartialEpoch = Pick<Input, "index">;
export type PartialInput = Pick<Input, "index"> & { epoch: PartialEpoch };
export type PartialReport = Pick<
    Report,
    "__typename" | "id" | "index" | "payload"
> & {
    input: PartialInput;
};

// define a type predicate to filter out reports
const isPartialReport = (n: PartialReport | null): n is PartialReport =>
    n !== null;

/**
 * Queries a GraphQL server for reports based on input keys
 * @param url URL of the GraphQL server
 * @param input input identification keys
 * @returns List of reports, returned as PartialReport objects
 */
export const getReports = async (
    url: string,
    inputKeys: InputKeys
): Promise<PartialReport[]> => {
    // create GraphQL client to reader server
    const client = createClient({ url, exchanges: defaultExchanges, fetch });

    // query the GraphQL server for reports corresponding to the input keys
    console.log(
        `querying ${url} for reports of ${JSON.stringify(inputKeys)}...`
    );

    if (
        inputKeys.epoch_index !== undefined &&
        inputKeys.input_index !== undefined
    ) {
        // list reports querying by epoch and input
        const { data, error } = await client
            .query(ReportsByEpochAndInputDocument, {
                epoch_index: inputKeys.epoch_index,
                input_index: inputKeys.input_index,
            })
            .toPromise();
        if (data?.epoch?.input?.reports) {
            return data.epoch.input.reports.nodes.filter<PartialReport>(
                isPartialReport
            );
        } else {
            return [];
        }
    } else if (inputKeys.epoch_index !== undefined) {
        // list reports querying only by epoch
        const { data, error } = await client
            .query(ReportsByEpochDocument, {
                epoch_index: inputKeys.epoch_index,
            })
            .toPromise();
        if (data?.epoch?.inputs) {
            // builds return reports array by concatenating each input's reports
            let ret: PartialReport[] = [];
            const inputs = data.epoch.inputs.nodes;
            for (let input of inputs) {
                ret = ret.concat(
                    input.reports.nodes.filter<PartialReport>(isPartialReport)
                );
            }
            return ret;
        } else {
            return [];
        }
    } else if (inputKeys.input_index !== undefined) {
        throw new Error(
            "Querying only by input index is not supported. Please define epoch index as well."
        );
    } else {
        // list reports using top-level query
        const { data, error } = await client
            .query(ReportsDocument, {})
            .toPromise();
        if (data?.reports) {
            return data.reports.nodes.filter<PartialReport>(isPartialReport);
        } else {
            return [];
        }
    }
};

/**
 * Queries a GraphQL server looking for a specific report
 * @param url URL of the GraphQL server
 * @param id ID of the report
 * @returns The corresponding report, returned as a full Report object
 */
export const getReport = async (url: string, id: string): Promise<Report> => {
    // create GraphQL client to reader server
    const client = createClient({ url, exchanges: defaultExchanges, fetch });

    // query the GraphQL server for the report
    console.log(`querying ${url} for report "${id}"...`);

    const { data, error } = await client
        .query(ReportDocument, { id })
        .toPromise();

    if (data?.report) {
        return data.report as Report;
    } else {
        throw new Error(error?.message);
    }
};

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
    NoticesDocument,
    NoticesByEpochDocument,
    NoticesByEpochAndInputDocument,
    Notice,
    Input,
    NoticeDocument,
} from "../../generated-src/graphql";
import { InputKeys } from "../commands/types";

// define PartialNotice type only with the desired fields of the full Notice defined by the GraphQL schema
export type PartialEpoch = Pick<Input, "index">;
export type PartialInput = Pick<Input, "index"> & { epoch: PartialEpoch };
export type PartialNotice = Pick<
    Notice,
    "__typename" | "id" | "index" | "payload"
> & {
    input: PartialInput;
};

// define a type predicate to filter out notices
const isPartialNotice = (n: PartialNotice | null): n is PartialNotice =>
    n !== null;

/**
 * Queries a GraphQL server for notices based on input keys
 * @param url URL of the GraphQL server
 * @param input input identification keys
 * @returns List of notices, returned as PartialNotice objects
 */
export const getNotices = async (
    url: string,
    inputKeys: InputKeys
): Promise<PartialNotice[]> => {
    // create GraphQL client to reader server
    const client = createClient({ url, exchanges: defaultExchanges, fetch });

    // query the GraphQL server for notices corresponding to the input keys
    console.log(
        `querying ${url} for notices of ${JSON.stringify(inputKeys)}...`
    );

    if (
        inputKeys.epoch_index !== undefined &&
        inputKeys.input_index !== undefined
    ) {
        // list notices querying by epoch and input
        const { data, error } = await client
            .query(NoticesByEpochAndInputDocument, {
                epoch_index: inputKeys.epoch_index,
                input_index: inputKeys.input_index,
            })
            .toPromise();
        if (data?.epoch?.input?.notices) {
            return data.epoch.input.notices.nodes.filter<PartialNotice>(
                isPartialNotice
            );
        } else {
            return [];
        }
    } else if (inputKeys.epoch_index !== undefined) {
        // list notices querying only by epoch
        const { data, error } = await client
            .query(NoticesByEpochDocument, {
                epoch_index: inputKeys.epoch_index,
            })
            .toPromise();
        if (data?.epoch?.inputs) {
            // builds return notices array by concatenating each input's notices
            let ret: PartialNotice[] = [];
            const inputs = data.epoch.inputs.nodes;
            for (let input of inputs) {
                ret = ret.concat(
                    input.notices.nodes.filter<PartialNotice>(isPartialNotice)
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
        // list notices using top-level query
        const { data, error } = await client
            .query(NoticesDocument, {})
            .toPromise();
        if (data?.notices) {
            return data.notices.nodes.filter<PartialNotice>(isPartialNotice);
        } else {
            return [];
        }
    }
};

/**
 * Queries a GraphQL server looking for a specific notice
 * @param url URL of the GraphQL server
 * @param id ID of the notice
 * @returns The corresponding notice, returned as a full Notice object
 */
export const getNotice = async (url: string, id: string): Promise<Notice> => {
    // create GraphQL client to reader server
    const client = createClient({ url, exchanges: defaultExchanges, fetch });

    // query the GraphQL server for the notice
    console.log(`querying ${url} for notice "${id}"...`);

    const { data, error } = await client
        .query(NoticeDocument, { id })
        .toPromise();

    if (data?.notice) {
        return data.notice as Notice;
    } else {
        throw new Error(error?.message);
    }
};

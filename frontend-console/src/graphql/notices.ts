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
    NoticesByInputDocument,
    Notice,
    Input,
    NoticeDocument,
} from "../../generated-src/graphql";

// define PartialNotice type only with the desired fields of the full Notice defined by the GraphQL schema
export type PartialInput = Pick<Input, "index">;
export type PartialNotice = Pick<Notice, "__typename" | "index" | "payload"> & {
    input: PartialInput;
};
export type PartialNoticeEdge = { node: PartialNotice };

// define a type predicate to filter out notice edges
const isPartialNoticeEdge = (
    n: PartialNoticeEdge | null
): n is PartialNoticeEdge => n !== null;

/**
 * Queries a GraphQL server for notices based on an input index
 * @param url URL of the GraphQL server
 * @param input input index
 * @returns List of notices, returned as PartialNotice objects
 */
export const getNotices = async (
    url: string,
    inputIndex?: number
): Promise<PartialNotice[]> => {
    // create GraphQL client to reader server
    const client = createClient({ url, exchanges: defaultExchanges, fetch });

    // query the GraphQL server for notices corresponding to the input index
    console.log(
        `querying ${url} for notices of input index "${inputIndex}"...`
    );

    if (inputIndex !== undefined) {
        // list notices querying by input
        const { data, error } = await client
            .query(NoticesByInputDocument, {
                inputIndex: inputIndex,
            })
            .toPromise();
        if (data?.input?.notices?.edges) {
            return data.input.notices.edges
                .filter<PartialNoticeEdge>(isPartialNoticeEdge)
                .map((e) => e.node);
        } else {
            return [];
        }
    } else {
        // list notices using top-level query
        const { data, error } = await client
            .query(NoticesDocument, {})
            .toPromise();
        if (data?.notices?.edges) {
            return data.notices.edges
                .filter<PartialNoticeEdge>(isPartialNoticeEdge)
                .map((e) => e.node);
        } else {
            return [];
        }
    }
};

/**
 * Queries a GraphQL server looking for a specific notice
 * @param url URL of the GraphQL server
 * @param noticeIndex notice index
 * @param inputIndex input index
 * @returns The corresponding notice, returned as a full Notice object
 */
export const getNotice = async (
    url: string,
    noticeIndex: number,
    inputIndex: number
): Promise<Notice> => {
    // create GraphQL client to reader server
    const client = createClient({ url, exchanges: defaultExchanges, fetch });

    // query the GraphQL server for the notice
    console.log(
        `querying ${url} for notice with index "${noticeIndex}" from input "${inputIndex}"...`
    );

    const { data, error } = await client
        .query(NoticeDocument, { noticeIndex, inputIndex })
        .toPromise();

    if (data?.notice) {
        return data.notice as Notice;
    } else {
        throw new Error(error?.message);
    }
};

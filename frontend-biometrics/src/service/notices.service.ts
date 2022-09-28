// Copyright 2022 Cartesi Pte. Ltd.

// Licensed under the Apache License, Version 2.0 (the "License"); you may not use
// this file except in compliance with the License. You may obtain a copy of the
// License at http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software distributed
// under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
// CONDITIONS OF ANY KIND, either express or implied. See the License for the
// specific language governing permissions and limitations under the License.

import { ethers } from "ethers";
import {
    NoticesByEpochAndInputDocument,
    Notice,
    NoticesByEpochAndInputQueryVariables,
} from "../../generated/graphql";
import { client } from "./config/client";

export interface NoticeViewModel extends Notice {
    payload_parsed: string;
}

export interface GetNoticesResult {
    data: NoticeViewModel[] | null;
    error: string | null;
}

// define a type predicate to filter out notices
export const isPartialNotice = (n: Notice | null): n is Notice => n !== null;

/**
 * Queries a GraphQL server looking for the notices of an input
 * @param input Blockchain event of input added or the notice keys to be queried
 * @param timeout How long to wait for notice to be detected
 * @returns List of notices
 */

export const getNotices = async (
    noticeQueryVariables: NoticesByEpochAndInputQueryVariables,
    noCache?: boolean
): Promise<GetNoticesResult> => {
    const result: GetNoticesResult = { data: null, error: null };
    // query the GraphQL server for notices of our input
    const { data, error, errors } = await client.query({
        query: NoticesByEpochAndInputDocument,
        variables: noticeQueryVariables,
        fetchPolicy: noCache ? "network-only" : "cache-first",
        errorPolicy: "ignore",
    });

    const notices = data?.epoch?.input?.notices?.nodes;
    if (!!notices) {
        result.data = notices.filter(isPartialNotice).map((notice: Notice) => ({
            ...notice,
            payload_parsed: ethers.utils.toUtf8String(notice.payload),
        }));
    } else if (!!error?.message) {
        result.error = error.message;
    } else if (!!errors?.length) {
        // @ts-ignore:next-line
        const errorMessage: string = errors.reduce((prev, next) => {
            return `${prev?.message || ""}\n${next?.message || ""}`;
        });
        result.error = errorMessage;
    }

    return result;
};

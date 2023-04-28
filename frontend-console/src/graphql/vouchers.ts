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
    VouchersDocument,
    VouchersByInputDocument,
    Voucher,
    Input,
    VoucherDocument,
} from "../../generated-src/graphql";

// define PartialVoucher type only with the desired fields of the full Voucher defined by the GraphQL schema
export type PartialInput = Pick<Input, "index">;
export type PartialVoucher = Pick<
    Voucher,
    "__typename" | "index" | "destination" | "payload"
> & {
    input: PartialInput;
};
export type PartialVoucherEdge = { node: PartialVoucher };

// define a type predicate to filter out vouchers
const isPartialVoucherEdge = (
    n: PartialVoucherEdge | null
): n is PartialVoucherEdge => n !== null;

/**
 * Queries a GraphQL server for vouchers based on an input index
 * @param url URL of the GraphQL server
 * @param input input index
 * @returns List of vouchers, returned as PartialVoucher objects
 */
export const getVouchers = async (
    url: string,
    inputIndex?: number
): Promise<PartialVoucher[]> => {
    // create GraphQL client to reader server
    const client = createClient({ url, exchanges: defaultExchanges, fetch });

    // query the GraphQL server for vouchers corresponding to the input index
    console.log(
        `querying ${url} for vouchers of input index "${inputIndex}"...`
    );

    if (inputIndex !== undefined) {
        // list vouchers querying by input
        const { data, error } = await client
            .query(VouchersByInputDocument, {
                inputIndex: inputIndex,
            })
            .toPromise();
        if (data?.input?.vouchers?.edges) {
            return data.input.vouchers.edges
                .filter<PartialVoucherEdge>(isPartialVoucherEdge)
                .map((e) => e.node);
        } else {
            return [];
        }
    } else {
        // list vouchers using top-level query
        const { data, error } = await client
            .query(VouchersDocument, {})
            .toPromise();
        if (data?.vouchers?.edges) {
            return data.vouchers.edges
                .filter<PartialVoucherEdge>(isPartialVoucherEdge)
                .map((e) => e.node);
        } else {
            return [];
        }
    }
};

/**
 * Queries a GraphQL server looking for a specific voucher
 * @param url URL of the GraphQL server
 * @param noticeIndex notice index
 * @param inputIndex input index
 * @returns The corresponding voucher, returned as a full Voucher object
 */
export const getVoucher = async (
    url: string,
    voucherIndex: number,
    inputIndex: number
): Promise<Voucher> => {
    // create GraphQL client to reader server
    const client = createClient({ url, exchanges: defaultExchanges, fetch });

    // query the GraphQL server for the voucher
    console.log(
        `querying ${url} for voucher with index "${voucherIndex}" from input "${inputIndex}"...`
    );

    const { data, error } = await client
        .query(VoucherDocument, { voucherIndex, inputIndex })
        .toPromise();

    if (data?.voucher) {
        return data.voucher as Voucher;
    } else {
        throw new Error(error?.message);
    }
};

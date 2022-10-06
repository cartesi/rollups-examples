// Copyright 2022 Cartesi Pte. Ltd.

// Licensed under the Apache License, Version 2.0 (the "License"); you may not use
// this file except in compliance with the License. You may obtain a copy of the
// License at http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software distributed
// under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
// CONDITIONS OF ANY KIND, either express or implied. See the License for the
// specific language governing permissions and limitations under the License.

import { Dispatch } from "react";
import {
    SendInputViewModel,
    sendInput as sendInputService,
} from "../service/send.service";
import { ServiceReducerActions } from "./use-service/use-service.hook";
import { WalletState, ConnectedChain } from "@web3-onboard/core";

export interface SendInputData {
    chunk: number | "final";
    content: string;
    imageId: string;
}

export const sendInput = async (
    dispatch: Dispatch<ServiceReducerActions<SendInputViewModel>>,
    data: SendInputData,
    chainId: ConnectedChain["id"],
    walletProvider: WalletState["provider"]
) => {
    dispatch({ type: "start_request" });
    try {
        const sendInputResult = await sendInputService(
            {
                input: JSON.stringify(data),
            },
            chainId,
            walletProvider
        );
        dispatch({
            type: "resolve_request",
            data: sendInputResult,
        });

        return sendInputResult;
    } catch (err) {
        dispatch({ type: "fail_request", error: err });

        throw err;
    }
};

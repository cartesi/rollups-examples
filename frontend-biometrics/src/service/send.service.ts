// Copyright 2022 Cartesi Pte. Ltd.

// Licensed under the Apache License, Version 2.0 (the "License"); you may not use
// this file except in compliance with the License. You may obtain a copy of the
// License at http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software distributed
// under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
// CONDITIONS OF ANY KIND, either express or implied. See the License for the
// specific language governing permissions and limitations under the License.

import { connect } from "./config/connect";
import { ContractReceipt, ethers } from "ethers";
import {
    InputMaybe,
    NoticesByEpochAndInputQueryVariables,
} from "../../generated/graphql";
import { InputAddedEvent } from "@cartesi/rollups/dist/src/types/contracts/interfaces/IInput";
import { WalletState, ConnectedChain } from "@web3-onboard/core";

interface SendInputParams {
    input: string;
}

export interface SendInputViewModel {
    epochNumber: InputMaybe<number>;
    inputIndex: InputMaybe<number>;
}
// TODO document this function
export const findNoticeKeys = (
    receipt: ContractReceipt
): NoticesByEpochAndInputQueryVariables => {
    // get InputAddedEvent from transaction receipt
    const event = receipt.events?.find((e) => e.event === "InputAdded");

    if (!event) {
        throw new Error(
            `InputAdded event not found in receipt of transaction ${receipt.transactionHash}`
        );
    }

    const inputAdded = event as InputAddedEvent;
    return {
        epoch_index: inputAdded.args.epochNumber.toNumber(),
        input_index: inputAdded.args.inputIndex.toNumber(),
    };
};

export const sendInput = async (
    params: SendInputParams,
    chainId: ConnectedChain["id"],
    walletProvider: WalletState["provider"]
): Promise<SendInputViewModel> => {
    const { input } = params;

    // connect to provider
    const { inputContract } = connect(chainId, walletProvider);

    // convert string to input bytes
    const inputBytes = ethers.utils.toUtf8Bytes(input);

    // send transaction
    const tx = await inputContract.addInput(inputBytes);
    const confirmationsCount = 1;
    const receipt = await tx.wait(confirmationsCount);

    // find reference to notice from transaction receipt
    const noticeKeys = findNoticeKeys(receipt);
    return {
        epochNumber: noticeKeys.epoch_index,
        inputIndex: noticeKeys.input_index,
    };
};

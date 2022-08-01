import { connect } from "./configs/connect";
import { rollups } from "./configs/rollups";
import { ContractReceipt, ethers } from "ethers";
import { InputMaybe, NoticeKeys } from "../../generated/graphql";
import { InputAddedEvent } from "@cartesi/rollups/dist/src/types/contracts/interfaces/IInput";
import {
    ACCOUNT_INDEX,
    DAPP_ADDRESS,
    DAPP_NAME,
    HARDHAT_DEFAULT_MNEMONIC,
    HARDHAT_DEFAULT_RPC_URL
} from "./configs/constants";

interface SendInputParams {
    input: string;
}

export interface SendInputViewModel {
    epochNumber: InputMaybe<string> | undefined;
    inputIndex: InputMaybe<string> | undefined;
}

export const findNoticeKeys = (receipt: ContractReceipt): NoticeKeys => {
    // get InputAddedEvent from transaction receipt
    const event = receipt.events?.find((e) => e.event === "InputAdded");

    if (!event) {
        throw new Error(
            `InputAdded event not found in receipt of transaction ${receipt.transactionHash}`
        );
    }

    const inputAdded = event as InputAddedEvent;
    return {
        epoch_index: inputAdded.args.epochNumber.toString(),
        input_index: inputAdded.args.inputIndex.toString(),
    };
};

export const sendInput = async (params: SendInputParams): Promise<SendInputViewModel> => {
    const { input } = params;

    // connect to provider
    const { provider, signer } = connect(
        HARDHAT_DEFAULT_RPC_URL,
        HARDHAT_DEFAULT_MNEMONIC,
        ACCOUNT_INDEX
    );
    await provider.getNetwork();
    

    // connect to rollups,
    const { inputContract } = await rollups(signer || provider, {
        ...params,
        dapp: DAPP_NAME,
        address: DAPP_ADDRESS,
    });
    await inputContract.signer.getAddress();

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
        inputIndex: noticeKeys.input_index
    };
};
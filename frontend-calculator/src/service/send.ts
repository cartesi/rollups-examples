import { Args as ConnectArgs, connect } from "./configs/connect";
import { Args as RollupsArgs, rollups } from "./configs/rollups";
import { ContractReceipt, ethers } from "ethers";
import { NoticeKeys } from "../../generated/graphql";
import { InputAddedEvent } from "@cartesi/rollups/dist/src/types/contracts/interfaces/IInput";

interface Args extends ConnectArgs, RollupsArgs {
    input: string;
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

export const sendInput = async (args: Args) => {
    const { rpc, input, mnemonic, accountIndex } = args;

    // connect to provider
    console.log(`connecting to ${rpc}`);
    const { provider, signer } = connect(rpc, mnemonic, accountIndex);

    const network = await provider.getNetwork();
    console.log(`connected to chain ${network.chainId}`);

    // connect to rollups,
    const { inputContract } = await rollups(signer || provider, args);

    const signerAddress = await inputContract.signer.getAddress();
    console.log(`using account "${signerAddress}"`);

    // use message from command line option, or from user prompt
    console.log(`sending "${input}"`);

    // convert string to input bytes
    const inputBytes = ethers.utils.toUtf8Bytes(input);

    // send transaction
    const tx = await inputContract.addInput(inputBytes);
    console.log(`transaction: ${tx.hash}`);
    console.log("waiting for confirmation...");
    const receipt = await tx.wait(1);

    // find reference to notice from transaction receipt
    const noticeKeys = findNoticeKeys(receipt);
    return {
        message: `input ${noticeKeys.input_index} added to epoch ${noticeKeys.epoch_index}`,
    };
};
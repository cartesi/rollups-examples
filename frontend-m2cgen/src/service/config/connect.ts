import { JsonRpcProvider, Provider } from "@ethersproject/providers";
import { ethers, Signer } from "ethers";

export interface Args {
    rpc: string;
    mnemonic?: string;
    accountIndex: number;
}

export type Connection = {
    provider: Provider;
    signer?: Signer;
};

export const connect = (
    rpc: string,
    mnemonic?: string,
    accountIndex?: number
): Connection => {
    // connect to JSON-RPC provider
    const provider = new JsonRpcProvider(rpc);

    // create signer to be used to send transactions
    const signer = mnemonic
        ? ethers.Wallet.fromMnemonic(
              mnemonic,
              //TODO: where does this wallet mnemonic come from?
              `m/44'/60'/0'/0/${accountIndex ?? 0}`
          ).connect(provider)
        : undefined;

    return {
        provider,
        signer,
    };
};

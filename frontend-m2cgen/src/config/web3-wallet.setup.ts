import injectedModule from "@web3-onboard/injected-wallets";
import { init } from "@web3-onboard/react";
import { app as appConstants } from "../config/constants";
import {
    Chain, ChainId, ChainLabel, ChainRpcUrl, ChainToken, WalletName, WalletUrl
} from "./types";

export const chains: Chain[] = [
    {
        id: ChainId.localhost,
        token: ChainToken.localhost,
        label: ChainLabel.localhost,
        rpcUrl: ChainRpcUrl.localhost,
    },
    {
        id: ChainId.testnet,
        token: ChainToken.testnet,
        label: ChainLabel.testnet,
        rpcUrl: ChainRpcUrl.testnet,
    },
];

const wallets = Object.keys(WalletName).map((wallet) => ({
    name: wallet,
    url: WalletUrl[wallet as keyof typeof WalletUrl],
}));

export const initWeb3Wallet = () => {
    const injected = injectedModule();
    init({
        wallets: [injected],
        chains,
        appMetadata: {
            name: appConstants.metadata.title,
            icon: "<svg><svg/>", //TODO: change it to app brand icon
            description: appConstants.metadata.description,
            recommendedInjectedWallets: wallets,
        },
    });
};

import injectedModule from "@web3-onboard/injected-wallets";
import { init } from "@web3-onboard/react";
import { app as appConstants } from "../config/constants";

export const initWeb3Wallet = () => {
    const injected = injectedModule();
    init({
        wallets: [injected],
        //TODO: add m2cgen chain
        chains: [
            {
                id: "0x7a69",
                token: "ETH",
                label: "localhost",
                rpcUrl: "http://localhost:8545",
            },
        ],
        appMetadata: {
            name: appConstants.metadata.title,
            icon: "<svg><svg/>", //TODO: change it to app brand icon
            description: appConstants.metadata.description,
            recommendedInjectedWallets: [
                { name: "MetaMask", url: "https://metamask.io" },
                { name: "Coinbase", url: "https://wallet.coinbase.com/" },
            ],
        },
    });
};

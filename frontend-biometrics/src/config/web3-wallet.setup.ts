// Copyright 2022 Cartesi Pte. Ltd.

// Licensed under the Apache License, Version 2.0 (the "License"); you may not use
// this file except in compliance with the License. You may obtain a copy of the
// License at http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software distributed
// under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
// CONDITIONS OF ANY KIND, either express or implied. See the License for the
// specific language governing permissions and limitations under the License.

import injectedModule from "@web3-onboard/injected-wallets";
import { init } from "@web3-onboard/react";
import { app as appConstants } from "../config/constants";
import {
    Chain,
    ChainId,
    ChainLabel,
    ChainRpcUrl,
    ChainToken,
    WalletName,
    WalletUrl,
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

import { ethers } from "ethers";
import { genRollupsContracts, RollupsContracts } from "./rollups";
import { WalletState, ConnectedChain } from "@web3-onboard/core";

export const connect = (
    chainId: ConnectedChain['id'],
    walletProvider: WalletState['provider']
): RollupsContracts => {
    const provider = new ethers.providers.Web3Provider(
        walletProvider
    );

    const rollupContract = genRollupsContracts(chainId, provider);

    return rollupContract;
};

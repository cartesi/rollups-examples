import { useSetChain, useWallets } from "@web3-onboard/react";
import { ConnectedChain, WalletState } from "@web3-onboard/core";
import { ServiceReducerActions, useService, UseServiceState } from "./use-service.hook";
import { Dispatch } from "react";

interface UseOnboardedServiceState<Data = any> extends
    UseServiceState<Data>
{
    chain: ConnectedChain | null,
    wallet: WalletState
}

type UseOnboardedServiceReturn<Data> = [
    UseOnboardedServiceState<Data>,
    Dispatch<ServiceReducerActions<Data>>
]

export const useOnboardedService = <Data>(): UseOnboardedServiceReturn<Data> => {
    const [{ connectedChain }] = useSetChain();
    const [connectedWallet] = useWallets();
    const [seviceState, dispatch] = useService<Data>();

    return [
        {
            ...seviceState,
            chain: connectedChain,
            wallet: connectedWallet,
        },
        dispatch,
    ];
};

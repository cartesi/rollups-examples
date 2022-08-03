import {
    InputFacet,
    InputFacet__factory,
    OutputFacet,
    OutputFacet__factory,
    RollupsFacet,
    RollupsFacet__factory,

} from "@cartesi/rollups";
import polygon_mumbai from "@cartesi/rollups/export/abi/polygon_mumbai.json";
import goerli from "@cartesi/rollups/export/abi/goerli.json";
import { Web3Provider } from "@ethersproject/providers";
import { env } from "../../config/constants";
import { ConnectedChain } from "@web3-onboard/core";


export interface Args {
    dapp: string;
    address?: string;
    addressFile?: string;
}

export interface RollupsContracts {
    rollupsContract: RollupsFacet;
    inputContract: InputFacet;
    outputContract: OutputFacet;
}

export const rollupsAddress: Record<string, any> = {
    "0x7a69": env.VITE_DAPP_ADDRESS, // local hardhat
    "0x13881": "0xe219A4Ee9e1dFD132ED9F8e38B3519368cC9494F", // polygon_mumbai,
    "0x5": "0xea055Bc7BC53A63E1C018Ceea5B6AddA75016064", // goerli,
};

export const genRollupsContracts = (
    chainId: ConnectedChain["id"],
    provider: Web3Provider
): RollupsContracts => {
    // TODO: get programatically instead of this hardcode
    const address = rollupsAddress[chainId];

    if (!address) {
        throw new Error("unable to resolve DApp address");
    }

    // connect to contracts
    const inputContract = InputFacet__factory.connect(
        address,
        provider.getSigner()
    );
    const outputContract = OutputFacet__factory.connect(
        address,
        provider.getSigner()
    );
    const rollupsContract = RollupsFacet__factory.connect(
        address,
        provider.getSigner()
    );

    return {
        inputContract,
        outputContract,
        rollupsContract,
    };
};

import {
    InputFacet,
    InputFacet__factory,
    OutputFacet,
    OutputFacet__factory,
    ERC20PortalFacet,
    ERC20PortalFacet__factory,
} from "@cartesi/rollups";
import { Provider } from "@ethersproject/providers";
import { Signer } from "ethers";
import { DAPP_ADDRESS } from "./constants";

export interface Args {
    dapp: string;
    address?: string;
    addressFile?: string;
}

interface Contracts {
    inputContract: InputFacet;
    outputContract: OutputFacet;
    erc20Portal: ERC20PortalFacet;
}

export const rollups = async (
    provider: Provider | Signer,
    args: Args
): Promise<Contracts> => {
    const address = args?.address ?? DAPP_ADDRESS;
    //TODO: figure out how to get the address without node:fs module?

    if (!address) {
        throw new Error("unable to resolve DApp address");
    }

    // connect to contracts
    const inputContract = InputFacet__factory.connect(address, provider);
    const outputContract = OutputFacet__factory.connect(address, provider);
    const erc20Portal = ERC20PortalFacet__factory.connect(address, provider);

    return {
        inputContract,
        outputContract,
        erc20Portal,
    };
};
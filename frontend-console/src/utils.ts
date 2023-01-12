import fs from "fs";
import { Contract } from "./abi";

/**
 * Read address from json file
 * @param path Path of file with address in json file
 * @returns address or undefined if file does not exist
 */
export const readAddressFromFile = (path: string | undefined): string | undefined => {
    return readObjectFromFile(path)?.address;
};

/**
 * Read object from json file
 * @param path Path of file with object in json file
 * @returns object or undefined if file does not exist
 */
export const readObjectFromFile = (path: string | undefined): any | undefined => {
    if (path && fs.existsSync(path)) {
        return JSON.parse(fs.readFileSync(path, "utf8"));
    }
};

/**
 * Read contract from json file
 * @param path Path of file with Contract in json file
 * @returns The Contract or undefined if file does not exist
 */
export const readContractFromFile = (path: string | undefined): Contract => {
    return readObjectFromFile(path) as Contract
}

export const readAllContractsFromDir = (...paths: string[]): Record<string, Contract> => {
    const contracts: Record<string, Contract> = {};
    for (let i = 0; i < paths.length; i++) {
        let path = paths[i];
        if (path && fs.existsSync(path)) {
            const deployContents: fs.Dirent[] = fs.readdirSync(path, { withFileTypes: true })
            deployContents.forEach(deployEntry => {
                if (deployEntry.isFile()) {
                    const filename = deployEntry.name;
                    if (filename.endsWith(".json") && filename !== "dapp.json") {
                        const contractName = filename.substring(0, filename.lastIndexOf("."));
                        contracts[contractName] = readContractFromFile(`${path}/${filename}`)
                    }
                }
            });
        }
    }
    return contracts
}

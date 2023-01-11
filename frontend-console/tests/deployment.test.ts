import chai from "chai";
import chaiAsPromised from "chai-as-promised";
chai.use(chaiAsPromised);
const expect = chai.expect;

import { Contract } from "../src/abi";
import { readAllContractsFromDir } from "../src/utils"

describe("Frontend Console tests", () => {

    it("should load deployments at specific dir", async () => {

        const contracts: Record<string, Contract> = readAllContractsFromDir("./tests/resources/deployments")

        expect(
            Object.keys(contracts).length
        ).to.eq(4);
    });

})
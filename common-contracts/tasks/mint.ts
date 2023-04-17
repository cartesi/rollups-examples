import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { getEvent } from "./util";

task("mint-token", "Mint token for a given address")
  .addParam("recipient", "Address for which account you want to mint a token")
  .addParam("erc721", "Address of the ERC-721 contract being used")
  .setAction(async ({ recipient, erc721 }, hre: HardhatRuntimeEnvironment) => {
    const { ethers } = hre;

    const factory = await ethers.getContractFactory("SimpleERC721");
    const contract = await factory.attach(erc721);

    const tx = await contract.mintTo(recipient);
    const receipt = await tx.wait();

    const event = getEvent("Transfer", contract, receipt.logs);
    console.log(
      `Token ${event?.args.tokenId} was minted for ${event?.args.to} at tx: ${receipt.transactionHash}`
    );
  });

import React, { useState } from "react";
import { JsonRpcProvider } from "@ethersproject/providers";
import { ethers } from "ethers";
import { InputBox__factory } from "@cartesi/rollups";
import { Input, Button, useToast } from "@chakra-ui/react";

// OBS: change Echo DApp address as appropriate
const DAPP_ADDRESS = "0x6DF0A75b1DED722A8544Da197F7907a6e9E5B380";

// Standard configuration for local development environment
const INPUTBOX_ADDRESS = "0xD0Dd85da76c81Cc1D98191c42aDeAC51c6651F4B";
const HARDHAT_DEFAULT_MNEMONIC =
    "test test test test test test test test test test test junk";
const HARDHAT_LOCALHOST_RPC_URL = "http://localhost:8545";

// This component presents an input field and adds its contents as an input for the Echo DApp
function RoarForm() {
    const [value, setValue] = useState("");
    const [accountIndex] = useState(0);
    const toast = useToast();
    const [loading, setLoading] = useState(false);

    function handleSubmit(event) {
        event.preventDefault();
        const sendInput = async () => {
            setLoading(true);
            // Start a connection
            const provider = new JsonRpcProvider(HARDHAT_LOCALHOST_RPC_URL);
            const signer = ethers.Wallet.fromMnemonic(
                HARDHAT_DEFAULT_MNEMONIC,
                `m/44'/60'/0'/0/${accountIndex}`
            ).connect(provider);

            // Instantiate the InputBox contract
            const inputBox = InputBox__factory.connect(
                INPUTBOX_ADDRESS,
                signer
            );

            // Encode the input
            const inputBytes = ethers.utils.isBytesLike(value)
                ? value
                : ethers.utils.toUtf8Bytes(value);

            // Send the transaction
            const tx = await inputBox.addInput(DAPP_ADDRESS, inputBytes);
            console.log(`transaction: ${tx.hash}`);
            toast({
                title: "Transaction Sent",
                description: "waiting for confirmation",
                status: "success",
                duration: 9000,
                isClosable: true,
                position: "top-left",
            });

            // Wait for confirmation
            console.log("waiting for confirmation...");
            const receipt = await tx.wait(1);

            // Search for the InputAdded event
            const event = receipt.events?.find((e) => e.event === "InputAdded");

            setLoading(false);
            toast({
                title: "Transaction Confirmed",
                description: `Input added => index: ${event?.args.inboxInputIndex} `,
                status: "success",
                duration: 9000,
                isClosable: true,
                position: "top-left",
            });
            console.log(
                `Input added => index: ${event?.args.inboxInputIndex} `
            );
        };
        sendInput();
    }

    function handleChange(event) {
        setValue(event.target.value);
    }

    let buttonProps = {};
    if (loading) {
        buttonProps.isLoading = true;
    }
    return (
        <div>
            <img className="monster" src="/monster.jpg" alt="monster" />
            <a
                className="link"
                href="https://www.freepik.com/free-vector/monster-cartoon-yellow-background-with-image-creepy-one-eyed-horned-creature-with-terrible-grin-vector-illustration_31643399.htm#query=monster%20cartoon&position=2&from_view=keyword#position=2&query=monster%20cartoon"
            >
                Image by macrovector on Freepik{" "}
            </a>
            <form onSubmit={handleSubmit}>
                <label>
                    <p>Roar something!</p>
                </label>
                <Input
                    type="text"
                    focusBorderColor="yellow"
                    size="md"
                    value={value}
                    onChange={handleChange}
                ></Input>
                <Button {...buttonProps} type="submit" colorScheme="yellow">
                    Roar
                </Button>
            </form>
        </div>
    );
}

export default RoarForm;

// Copyright 2022 Cartesi Pte. Ltd.

// Licensed under the Apache License, Version 2.0 (the "License"); you may not use
// this file except in compliance with the License. You may obtain a copy of the
// License at http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software distributed
// under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
// CONDITIONS OF ANY KIND, either express or implied. See the License for the
// specific language governing permissions and limitations under the License.

import { useConnectWallet, useSetChain } from "@web3-onboard/react";
import { FC } from "react";
import { Col, Row } from "react-grid-system";
import { Button } from "../../atomic/button.mol/button.mol";
import { FieldsetWrapper } from "../../atomic/form.org/form.mol";
import { Input } from "../../atomic/form.org/input.mol";
import { Modal, IModal } from "../../atomic/layout.org/modal.mol/modal.mol";
import { Separator } from "../../atomic/layout.org/separator.mol/separator.atm";
import { string } from "./constants";

const modalString = string.manageWalletModal;

type IWalletManagerModal = Pick<IModal, "isOpen" | "onClose">;

export const WalletManagerModal: FC<IWalletManagerModal> = ({
    isOpen,
    onClose,
}) => {
    const [{ wallet, connecting }, connect, disconnect] = useConnectWallet();
    const [{ chains, connectedChain, settingChain }, setChain] = useSetChain();

    return (
        <Modal
            isOpen={isOpen}
            title={modalString.title}
            labelledBy={modalString.aria.labelledById}
            onClose={onClose}
        >
            <Separator large />
            {!!wallet ? (
                <>
                    <Row justify="center">
                        <Col xs={10} md={4}>
                            <FieldsetWrapper>
                                <Input
                                    id={modalString.switchChainInput.id}
                                    name={modalString.switchChainInput.name}
                                    disabled={settingChain}
                                    value={connectedChain?.id}
                                    type="select"
                                    variant="secondary"
                                    options={chains.map((chain) => ({
                                        id: chain.id,
                                        name: chain.label,
                                    }))}
                                    handleChange={(value) => {
                                        if (value)
                                            setChain({
                                                chainId: value,
                                            });
                                    }}
                                    isOutilined
                                />
                            </FieldsetWrapper>
                        </Col>
                    </Row>
                    <Separator />
                    <Row justify="center">
                        <Col xs="content">
                            <Button
                                variant="secondary"
                                onClick={() => {
                                    disconnect(wallet);
                                }}
                                disabled={settingChain}
                            >
                                {modalString.disconnectButton.text}
                            </Button>
                        </Col>
                    </Row>
                </>
            ) : (
                <Row justify="center">
                    <Col xs="content">
                        <Button
                            variant="secondary"
                            onClick={() => {
                                connect();
                            }}
                            disabled={connecting}
                        >
                            {connecting
                                ? modalString.connectButton.loading
                                : modalString.connectButton.text}
                        </Button>
                    </Col>
                </Row>
            )}
            <Separator />
        </Modal>
    );
};

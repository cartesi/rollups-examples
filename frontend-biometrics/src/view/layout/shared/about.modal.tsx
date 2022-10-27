// Copyright 2022 Cartesi Pte. Ltd.

// Licensed under the Apache License, Version 2.0 (the "License"); you may not use
// this file except in compliance with the License. You may obtain a copy of the
// License at http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software distributed
// under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
// CONDITIONS OF ANY KIND, either express or implied. See the License for the
// specific language governing permissions and limitations under the License.

import { FC } from "react";
import { Col, Row } from "react-grid-system";
import { Button } from "../../atomic/button.mol/button.mol";
import { IModal, Modal } from "../../atomic/layout.org/modal.mol/modal.mol";
import { Separator } from "../../atomic/layout.org/separator.mol/separator.atm";
import { H2, Paragraph } from "../../atomic/typography.mol";
import { string } from "./constants";

const modalString = string.aboutModal;

type AboutModal = Pick<IModal, "isOpen" | "onClose">;

export const AboutModal: FC<AboutModal> = ({ isOpen, onClose }) => (
    <Modal
        isOpen={isOpen}
        title={modalString.title}
        onClose={onClose}
        labelledBy={modalString.aria.labelledById}
    >
        <Row>
            <Col>
                <H2 color="dark">{modalString.textTitle}</H2>
                <Paragraph color="dark" justify>
                    {modalString.textContent1}
                </Paragraph>
                <Paragraph color="dark" justify>
                    {modalString.textContent2}
                </Paragraph>
            </Col>
        </Row>
        <Separator />
        <Row justify="center">
            <Col xs="content">
                <Button variant="secondary" onClick={onClose}>
                    {modalString.CTAButton.text}
                </Button>
            </Col>
        </Row>
    </Modal>
);

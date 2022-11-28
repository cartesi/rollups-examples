// Copyright 2022 Cartesi Pte. Ltd.

// Licensed under the Apache License, Version 2.0 (the "License"); you may not use
// this file except in compliance with the License. You may obtain a copy of the
// License at http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software distributed
// under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
// CONDITIONS OF ANY KIND, either express or implied. See the License for the
// specific language governing permissions and limitations under the License.

import { FC, PropsWithChildren, useEffect, useState } from "react";
import { Row, Col } from "react-grid-system";
import { H1 } from "../../typography.mol";
import {
    ModalCloseButton,
    ModalContent,
    ModalContentWrapper,
    ModalWrapper,
} from "./modal.style";
import { genTimerPromise } from "../../../../utils/timer-promise";
import { MODAL_FADEOUT_DELAY } from "./constants";

export interface IModal {
    isOpen: boolean;
    title: string;
    labelledBy?: string;
    onOpen?: () => void;
    onClose?: () => void;
}

export const Modal: FC<PropsWithChildren<IModal>> = ({
    children,
    isOpen,
    title,
    labelledBy,
    onClose,
    onOpen,
}) => {
    const [showModal, setShowModal] = useState(false);
    const closeModalFadeoutDelay = MODAL_FADEOUT_DELAY;
    const closeModalFadeoutTransitionDelayInSeconds =
        (MODAL_FADEOUT_DELAY - 100) / 1000;

    useEffect(() => {
        if (isOpen) {
            setShowModal(true);
            onOpen?.();
        } else {
            genTimerPromise(closeModalFadeoutDelay).then(() =>
                setShowModal(false)
            );
        }
    }, [isOpen]);

    return (
        <ModalWrapper isOpen={showModal} onDismiss={onClose}>
            <ModalContentWrapper
                initial={{ y: isOpen ? -100 : 1 }}
                animate={{
                    y: isOpen ? 1 : -1000,
                    transition: isOpen
                        ? undefined
                        : {
                              delay: closeModalFadeoutTransitionDelayInSeconds,
                              default: {
                                  ease: "linear",
                              },
                          },
                }}
            >
                <ModalContent aria-labelledby={labelledBy}>
                    <ModalCloseButton
                        onClick={() => {
                            onClose?.();
                        }}
                    />
                    <Row justify="center">
                        <Col xs="content">
                            <H1 id={labelledBy} color="dark">
                                {title}
                            </H1>
                        </Col>
                    </Row>
                    {children}
                </ModalContent>
            </ModalContentWrapper>
        </ModalWrapper>
    );
};

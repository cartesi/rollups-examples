// Copyright 2022 Cartesi Pte. Ltd.

// Licensed under the Apache License, Version 2.0 (the "License"); you may not use
// this file except in compliance with the License. You may obtain a copy of the
// License at http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software distributed
// under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
// CONDITIONS OF ANY KIND, either express or implied. See the License for the
// specific language governing permissions and limitations under the License.

import styled from "styled-components";
import { DialogOverlay, DialogContent } from "@reach/dialog";
import {
    border,
    color,
    radius,
    size,
    spacing,
    zIndex,
} from "../../styleguide.atm";
import { Button } from "../../button.mol/button.mol";
import { motion } from "framer-motion";

export const ModalWrapper = styled(DialogOverlay)`
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: ${zIndex.veryHigh};
    background-color: rgba(0, 0, 0, 0.5);
`;
export const ModalContentWrapper = styled(motion.div)`
    display: flex;
    justify-content: center;
    min-height: ${size.modal.minHeight};
    min-width: ${size.modal.minWidth};
    width: 60%;
    height: 60%;
`;
export const Test = styled(motion.div)`
    display: flex;
    justify-content: center;
    min-height: ${size.modal.minHeight};
    min-width: ${size.modal.minWidth};
    width: 60%;
    height: 60%;
`;

export const ModalContent = styled(DialogContent)`
    width: 100%;
    height: 100%;
    border-radius: ${radius.lg};
    border: ${border.large} ${color.sweetMain};
    padding: 0 ${spacing.padding.sm};
    background-color: ${color.white};
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    overflow-x: hidden;
`;

export const ModalCloseButton = styled(Button).attrs({ variant: "link" })`
    ::after {
        content: "X";
    }
    padding: ${spacing.padding.sm};
    margin-left: auto;
    width: fit-content;
    &:hover:enabled {
        color: ${color.sweetMain};
    }
`;

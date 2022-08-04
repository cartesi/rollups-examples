import styled from "styled-components";
import { DialogOverlay, DialogContent } from "@reach/dialog";
import { border, color, radius, size, spacing, zIndex } from "../../styleguide.atm";
import { Button } from "../../button.mol/button.mol";

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
export const ModalContent = styled(DialogContent)`
    border-radius: ${radius.lg};
    border: ${border.large} ${color.sweetMain};
    padding: 0 ${spacing.padding.sm};
    min-height: ${size.modal.minHeight};
    min-width: ${size.modal.minWidth};
    width: 60%;
    height: 60%;
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

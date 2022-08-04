import { FC, PropsWithChildren, useEffect } from "react";
import { ModalCloseButton, ModalContent, ModalWrapper } from "./modal.style";

export interface IModal {
    isOpen: boolean;
    onOpen?: () => void;
    onClose?: () => void;
}

export const Modal: FC<PropsWithChildren<IModal>> = ({
    children, isOpen, onClose, onOpen
}) => {

    useEffect(() => {
        if (onOpen) onOpen();
    },[])

    return (
        <ModalWrapper isOpen={isOpen} onDismiss={onClose}>
            <ModalContent>
                <ModalCloseButton onClick={()=> {onClose?.()}} />
                {children}
            </ModalContent>
        </ModalWrapper>
    );
}

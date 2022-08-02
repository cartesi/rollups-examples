import { FC } from "react";
import { Modal, IModal } from "../../atomic/layout.org/modal.mol/modal.mol";

export const WalletManagerModal: FC<IModal> = ({
    isOpen, onClose
}) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
        >
            {"My modal"}
        </Modal>
    );
}

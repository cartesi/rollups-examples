import { FC, PropsWithChildren, useState } from "react";
import { Container } from "react-grid-system";
import { Button } from "../../atomic/button.mol/button.mol";
import { Header, Main } from "../../atomic/layout.org/layout.mol";
import { Modal } from "../../atomic/layout.org/modal.mol/modal.mol";
import { H2 } from "../../atomic/typography.mol";
import { text } from "./constants";
import { WalletManagerModal } from "./wallet-manager.modal";

export const SharedLayout: FC<PropsWithChildren> = ({ children }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <Header>
                <H2 color="lightMain" paddingX="md" isBold>{text.header}</H2>
                <Button
                    variant="link"
                    onClick={() => { setIsModalOpen(true) }}
                >
                    {text.connectWalletButton.text}
                </Button>
                <WalletManagerModal
                    isOpen={isModalOpen}
                    onClose={() => { setIsModalOpen(false) }}
                />
            </Header>
            <Main>
                <Container fluid>
                    {children}
                </Container>
            </Main>
        </>
    )
};

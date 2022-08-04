import { FC, PropsWithChildren, useState } from "react";
import { Container } from "react-grid-system";
import { Button } from "../../atomic/button.mol/button.mol";
import { Header, Main } from "../../atomic/layout.org/layout.mol";
import { H2 } from "../../atomic/typography.mol";
import { string } from "./constants";
import { WalletManagerModal } from "./wallet-manager.modal";

export const SharedLayout: FC<PropsWithChildren> = ({ children }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <Header>
                <H2 color="lightMain" paddingX="md" isBold>{string.header}</H2>
                <Button
                    variant="link"
                    onClick={() => { setIsModalOpen(true) }}
                >
                    {string.manageWalletButton.text}
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

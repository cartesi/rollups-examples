import { FC, PropsWithChildren } from "react";
import { Container } from "react-grid-system";
import { Button } from "../../atomic/button.mol/button.mol";
import { Header, Main } from "../../atomic/layout.org/layout.mol";
import { H2 } from "../../atomic/typography.mol";
import { text } from "./constants";

export const SharedLayout: FC<PropsWithChildren> = ({ children }) => (
    <>
        <Header>
            <H2 color="lightMain" paddingX="md" isBold>{text.header}</H2>
            <Button variant="link">{text.connectWalletButton.text}</Button>
        </Header>
        <Main>
            <Container fluid>
                {children}
            </Container>
        </Main>
    </>
);

import { FC, PropsWithChildren } from "react";
import { Container } from "react-grid-system";
import { Header, Main } from "../../atomic/layout.atm";
import { H2 } from "../../atomic/typography.mol";
import { text } from "./constants";

export const SharedLayout: FC<PropsWithChildren> = ({ children }) => (
    <>
        <Header>
            <H2 color="lightMain" isBold>{text.header}</H2>
        </Header>
        <Main>
            <Container fluid>
                {children}
            </Container>
        </Main>
    </>
);

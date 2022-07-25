import { FC, PropsWithChildren } from "react";
import { Container, Row, Col } from "react-grid-system";
import { Header, Main } from "../../atomic/layout.org";

export const SharedLayout: FC<PropsWithChildren> = ({ children }) => (
    <>
        <Header>Header</Header>
        <Main>
            <Container>
                {children}
            </Container>
        </Main>
    </>
);

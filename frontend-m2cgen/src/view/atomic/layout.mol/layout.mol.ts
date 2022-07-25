import styled, { css } from "styled-components";
import { spacing } from "../styleguide.atm";

const sharedDefaultCss = css`
    padding: ${spacing.padding.layout};
`;

export const Header = styled.header`
    ${sharedDefaultCss}
    top: 0px;
    left: 0px;
    right: 0px;
`;
export const Main = styled.main`
    ${sharedDefaultCss}
`;

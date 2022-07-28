import styled, { css } from "styled-components";
import { border, color, radius, spacing } from "../styleguide.atm";

interface Layout {
    isFluid?: boolean;
}

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

export const BoxWrapper = styled.div<Layout>`
    padding: ${spacing.padding.md};
    border: ${border.small} ${color.mediumMain};
    border-radius: ${radius.lg};
    background: linear-gradient(
        to top left,
        ${color.main} 60%,
        ${color.mediumMain} 100%
    );
    ${({ isFluid }) => `
        ${isFluid ? "width: 100%; height: 100%;" : ""}
    `}
`;


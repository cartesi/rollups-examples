import styled, { css } from "styled-components";
import { color as colorConstant, spacing } from "./styleguide.atm";

interface SharedDefaultProps {
    color?: keyof typeof colorConstant;
    isBold?: boolean;
}

const sharedDefaultCss = css<SharedDefaultProps>`
    padding: 0 ${spacing.padding.typography};
    ${({ isBold, color }) => `
        ${isBold ? 'font-weight: 500;' : ''}
        color: ${colorConstant[color ?? 'white']};
    `};
`;

export const H1 = styled.h1<SharedDefaultProps>`
    ${sharedDefaultCss}
`;
export const H2 = styled.h2<SharedDefaultProps>`
    ${sharedDefaultCss}
`;
export const Paragraph = styled.p<SharedDefaultProps>`
    ${sharedDefaultCss}
`;
export const Label = styled.label<SharedDefaultProps>`
    ${sharedDefaultCss}
`;

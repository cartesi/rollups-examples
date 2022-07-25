import styled, { css } from "styled-components";
import { color as colorConstant, spacing } from "./styleguide.atm";

interface SharedDefaultProps {
    color?: keyof typeof colorConstant;
    isBold?: boolean;
    paddingX?: "sm" | "md" | "lg";
    paddingY?: "sm" | "md" | "lg";
}

const sharedDefaultCss = css<SharedDefaultProps>`
    word-break: break-all;
    ${({ isBold, color, paddingY, paddingX }) => `
        ${isBold ? "font-weight: 500;" : ""}
        padding: ${
            (paddingX || paddingX)
                ? `${paddingY ? spacing.padding[paddingY] : "0"}
                    ${paddingX ? spacing.padding[paddingX] : "0"}`
                : `${spacing.padding.sm} 0`
        };
        color: ${colorConstant[color ?? "white"]};
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

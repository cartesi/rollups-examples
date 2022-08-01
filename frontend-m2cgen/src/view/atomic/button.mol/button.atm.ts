import styled, { css } from "styled-components";
import { border, color, radius, size, spacing } from "../styleguide.atm";

export interface ButtonLayout {
    variant?: "primary" | "secondary";
    sideElement?: "left" | "right";
    disabled?: boolean;
}

const buttonSharedCss = css`
    padding: ${spacing.padding.md} ${spacing.padding.xlg};
    border-radius: ${radius.md};
    font-weight: 500;
    cursor: pointer;
`;

const buttonVariantCss = {
    primary: css`
        ${buttonSharedCss}
        border: ${border.general} ${color.white};
        background-color: ${color.white};
        &:hover:enabled {
            background-color: transparent;
            border: ${border.general} ${color.white};
            color: ${color.white};
        }

    `,
    secondary: css`
        ${buttonSharedCss}
    `
}

const sideElementCss = {
    left: css`
        padding-right: ${spacing.padding.md};
    `,
    right: css`
        padding-left: ${spacing.padding.md};
    `,
};

export const ButtonWrapper = styled.button<ButtonLayout>`
    ${({ variant }) => buttonVariantCss[variant ?? 'primary']}
    &:disabled {
        cursor: not-allowed;
    }
`;

export const SideElement = styled.span<ButtonLayout>`
    ${({ sideElement }) => sideElementCss[sideElement ?? 'right']}
    vertical-align: middle;
`;

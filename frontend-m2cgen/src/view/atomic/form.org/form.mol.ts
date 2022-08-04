import styled, { css } from "styled-components";
import { border, color, radius, size, spacing, zIndex } from "../styleguide.atm";

export interface InputLayout {
    isOutilined?: boolean;
    variant?: "primary" | "secondary";
}

const inputSharedCss = css`
    color: ${color.white};
    padding: ${spacing.padding.sm};
`;

const inputVariantCss = {
    primary: css<InputLayout>`
        ${inputSharedCss}
        ${({ isOutilined }) => `
            ${
                isOutilined ? `
                border: ${border.general} ${color.mediumGray};
                border-radius: ${radius.md};
                ` : ""
            }
        `}
    `,
    secondary: css<InputLayout>`
        ${inputSharedCss}
        color: black;
        ${({ isOutilined }) => `
            ${
                isOutilined ? `
                border: ${border.general} black;
                border-radius: ${radius.md};
                ` : ""
            }
        `}
    `,
};

export const FormWrapper = styled.form`
`;
export const FieldsetWrapper = styled.fieldset`
    display: flex;
    flex-direction: column;
`;
export const InputWrapper = styled.input<InputLayout>`
    ${({variant})=> inputVariantCss[variant ?? 'primary']}
`;
export const SelectWrapper = styled.div<InputLayout>`
    position: relative;
    height: ${size.input.select.wrapper.height};

    select {
        ${({ variant }) => inputVariantCss[variant ?? "primary"]}
        position: absolute;
        right: 0;
        left: 0;
        z-index: ${zIndex.veryLow};
    }
    option {
        background-color: ${({ variant }) =>
            !!variant && variant !== "primary" ? "inherit" : color.main};
    }
    span {
        position: absolute;
        right: 0.8rem;
        top: 0.8rem;
        color: ${({ variant }) =>
            !!variant && variant !== "primary" ? "inherit" : color.white
        };
    }
`;

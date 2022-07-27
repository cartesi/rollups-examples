import styled, { css } from "styled-components";
import { border, color, radius, spacing } from "../styleguide.atm";

export interface InputLayout {
    isOutilined?: boolean
}

const inputSharedCss = css<InputLayout>`
    color: ${color.white};
    padding: ${spacing.padding.sm};
    ${({ isOutilined }) => `
        ${
            isOutilined
                ? `
    border: ${border.general} ${color.mediumGray};
    border-radius: ${radius.md};
    `
                : ""
        }
    `}
`;

export const FormWrapper = styled.form`
`;
export const FieldsetWrapper = styled.fieldset`
    display: flex;
    flex-direction: column;
`;
export const InputWrapper = styled.input<InputLayout>`
    ${inputSharedCss}
`;
export const SelectWrapper = styled.select`
    ${inputSharedCss}
    option {
        background-color: ${color.main};
    }
`;

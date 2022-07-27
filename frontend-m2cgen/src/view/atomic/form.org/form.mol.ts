import styled, { css } from "styled-components";
import { border, color, radius, spacing, zIndex } from "../styleguide.atm";

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
export const SelectWrapper = styled.div`
    position: relative;
    select {
        ${inputSharedCss}
        position: absolute;
        right: 0;
        left: 0;
        z-index: ${zIndex.veryLow};
    }
    option {
        background-color: ${color.main};
    }
    span {
        position: absolute;
        right: 0.8rem;
        top: 0.8rem;
        color: ${color.white};
    }
`;

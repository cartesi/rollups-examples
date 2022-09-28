// Copyright 2022 Cartesi Pte. Ltd.

// Licensed under the Apache License, Version 2.0 (the "License"); you may not use
// this file except in compliance with the License. You may obtain a copy of the
// License at http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software distributed
// under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
// CONDITIONS OF ANY KIND, either express or implied. See the License for the
// specific language governing permissions and limitations under the License.

import styled, { css } from "styled-components";
import {
    border,
    color,
    radius,
    size,
    spacing,
    zIndex,
} from "../styleguide.atm";

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
                isOutilined
                    ? `
                border: ${border.general} ${color.mediumGray};
                border-radius: ${radius.md};
                `
                    : ""
            }
        `}
    `,
    secondary: css<InputLayout>`
        ${inputSharedCss}
        color: black;
        ${({ isOutilined }) => `
            ${
                isOutilined
                    ? `
                border: ${border.general} black;
                border-radius: ${radius.md};
                `
                    : ""
            }
        `}
    `,
};

export const FormWrapper = styled.form``;
export const FieldsetWrapper = styled.fieldset`
    display: flex;
    flex-direction: column;
`;
export const InputWrapper = styled.input<InputLayout>`
    ${({ variant }) => inputVariantCss[variant ?? "primary"]}
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
            !!variant && variant !== "primary" ? "inherit" : color.white};
    }
`;

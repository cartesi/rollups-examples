// Copyright 2022 Cartesi Pte. Ltd.

// Licensed under the Apache License, Version 2.0 (the "License"); you may not use
// this file except in compliance with the License. You may obtain a copy of the
// License at http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software distributed
// under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
// CONDITIONS OF ANY KIND, either express or implied. See the License for the
// specific language governing permissions and limitations under the License.

import styled, { css } from "styled-components";
import { border, color, radius, spacing } from "../styleguide.atm";

export interface ButtonLayout {
    variant?: "primary" | "secondary" | "link";
    sideElement?: "left" | "right";
    disabled?: boolean;
}

const buttonSharedCss = css`
    padding: ${spacing.padding.md} ${spacing.padding.xlg};
    border-radius: ${radius.md};
    font-weight: 500;
    cursor: pointer;
`;

export const buttonVariantCss = {
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
        border: ${border.general} ${color.sweetMain};
        background-color: ${color.sweetMain};
        color: ${color.white};
        &:hover:enabled {
            background-color: transparent;
            border: ${border.general} ${color.lightMain};
            color: ${color.lightMain};
        }
    `,
    link: css`
        ${buttonSharedCss}
        color: ${color.lightMain};
        text-decoration: underline;
        &:hover:enabled {
            color: ${color.white};
        }
        padding: 0;
    `,
};

const sideElementCss = {
    left: css`
        padding-right: ${spacing.padding.md};
    `,
    right: css`
        padding-left: ${spacing.padding.md};
    `,
};

export const ButtonWrapper = styled.button<ButtonLayout>`
    ${({ variant }) => buttonVariantCss[variant ?? "primary"]}
    &:disabled {
        cursor: not-allowed;
    }
`;

export const SideElement = styled.span<ButtonLayout>`
    ${({ sideElement }) => sideElementCss[sideElement ?? "right"]}
    vertical-align: middle;
`;

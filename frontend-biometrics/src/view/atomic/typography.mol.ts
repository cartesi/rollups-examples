// Copyright 2022 Cartesi Pte. Ltd.

// Licensed under the Apache License, Version 2.0 (the "License"); you may not use
// this file except in compliance with the License. You may obtain a copy of the
// License at http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software distributed
// under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
// CONDITIONS OF ANY KIND, either express or implied. See the License for the
// specific language governing permissions and limitations under the License.

import styled, { css } from "styled-components";
import { color as colorConstant, spacing } from "./styleguide.atm";

interface SharedDefaultProps {
    color?: keyof typeof colorConstant;
    isBold?: boolean;
    noPadding?: boolean;
    paddingX?: "sm" | "md" | "lg";
    paddingY?: "sm" | "md" | "lg";
    justify?: "start" | "center" | "end";
}

const sharedDefaultCss = css<SharedDefaultProps>`
    word-break: keep-all;
    ${({ isBold, color, noPadding, paddingY, paddingX, justify }) => `
        ${isBold ? "font-weight: 500;" : ""}
        padding: ${
            noPadding ? '0' : (
                paddingX || paddingX
                ? `${paddingY ? spacing.padding[paddingY] : "0"}
                    ${paddingX ? spacing.padding[paddingX] : "0"}`
                : `${spacing.padding.sm} 0`
                )
        };
        ${justify ? `text-align: ${justify};` : ""}
        color: ${colorConstant[color ?? "white"]};
    `};
`;

export const H1 = styled.h1<SharedDefaultProps>`
    ${sharedDefaultCss}
    font-size: 2rem;
`;
export const H2 = styled.h2<SharedDefaultProps>`
    ${sharedDefaultCss}
    font-size: 1.2rem;
`;
export const H4 = styled.h4<SharedDefaultProps>`
    ${sharedDefaultCss}
    font-size: 0.8rem;
`;
export const Paragraph = styled.p<SharedDefaultProps>`
    ${sharedDefaultCss}
`;
export const Label = styled.label<SharedDefaultProps>`
    ${sharedDefaultCss}
`;

// Copyright 2022 Cartesi Pte. Ltd.

// Licensed under the Apache License, Version 2.0 (the "License"); you may not use
// this file except in compliance with the License. You may obtain a copy of the
// License at http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software distributed
// under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
// CONDITIONS OF ANY KIND, either express or implied. See the License for the
// specific language governing permissions and limitations under the License.

import { Col } from "react-grid-system";
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
    display: flex;
    justify-content: space-between;
`;

export const Main = styled.main`
    ${sharedDefaultCss}
`;

export const BoxWrapper = styled(Col)<Layout>`
    padding: 0 ${spacing.padding.md};
    border: ${border.small} ${color.mediumMain};
    border-radius: ${radius.lg};
    background: linear-gradient(
        to top left,
        ${color.main} 60%,
        ${color.mediumMain} 100%
    );
    ${({ isFluid }) => `
        ${isFluid ? "width: 100%; height: auto;" : ""}
    `}
`;

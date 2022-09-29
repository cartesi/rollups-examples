// Copyright 2022 Cartesi Pte. Ltd.

// Licensed under the Apache License, Version 2.0 (the "License"); you may not use
// this file except in compliance with the License. You may obtain a copy of the
// License at http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software distributed
// under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
// CONDITIONS OF ANY KIND, either express or implied. See the License for the
// specific language governing permissions and limitations under the License.

import styled from "styled-components";
import { size as sizeConstant } from "../styleguide.atm";

export interface ImageLayout {
    justify?: "start" | "center" | "end";
    size?: keyof typeof sizeConstant.image;
}

export const ImageWrapper = styled.div<ImageLayout>`
    display: flex;
    flex-direction: column;
    justify-content: ${({ justify }) =>
        justify === "center" ? justify : `flex-${justify}`};
    height: ${({ size }) => (size ? sizeConstant.image[size] : "auto")};
    img {
        ${({ size }) => size ? `
            height: inherit;
            width: fit-content;
        ` : ''}
    }
`;

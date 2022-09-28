// Copyright 2022 Cartesi Pte. Ltd.

// Licensed under the Apache License, Version 2.0 (the "License"); you may not use
// this file except in compliance with the License. You may obtain a copy of the
// License at http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software distributed
// under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
// CONDITIONS OF ANY KIND, either express or implied. See the License for the
// specific language governing permissions and limitations under the License.

import { FC, PropsWithChildren } from "react";
import { AiOutlineLeft, AiOutlineRight } from "react-icons/ai";
import { ButtonLayout, ButtonWrapper, SideElement } from "./button.atm";

interface IButton
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
        ButtonLayout {}

export const Button: FC<PropsWithChildren<IButton>> = ({
    children,
    sideElement,
    ...other
}) => {
    return (
        <ButtonWrapper {...other}>
            {sideElement === "left" ? (
                <SideElement sideElement={sideElement}>
                    <AiOutlineLeft />
                </SideElement>
            ) : null}
            {children}
            {sideElement === "right" ? (
                <SideElement sideElement={sideElement}>
                    <AiOutlineRight />
                </SideElement>
            ) : null}
        </ButtonWrapper>
    );
};

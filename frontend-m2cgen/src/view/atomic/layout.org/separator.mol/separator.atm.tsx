import React, { FC } from "react";
import {
    SeparatorLayout,
    SeparatorStrawStyled,
    SeparatorStyled,
} from "./separator.style";

export const Separator: FC<SeparatorLayout> = (props) => {
    return (
        <SeparatorStyled {...props}>
            <SeparatorStrawStyled outlined={props?.outlined} />
        </SeparatorStyled>
    );
};

import { FC, PropsWithChildren } from "react";
import { ButtonLayout, ButtonWrapper, SideElement } from "./button.atm";

interface IButton extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    ButtonLayout
{ }

export const Button: FC<PropsWithChildren<IButton>> = ({
    children,
    sideElement,
    ...other
}) => {
    return (
        <ButtonWrapper {...other}>
            {sideElement === "left" ?
                <SideElement sideElement={sideElement}>
                    {"<"}
                </SideElement> :
                null}
            {children}
            {sideElement === "right" ?
                <SideElement sideElement={sideElement}>
                    {">"}
                </SideElement> :
                null}
        </ButtonWrapper>
    );
}

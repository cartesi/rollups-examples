import { FC, PropsWithChildren } from "react";
import { AiOutlineLeft, AiOutlineRight } from "react-icons/ai";
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
                    <AiOutlineLeft />
                </SideElement> :
                null}
            {children}
            {sideElement === "right" ?
                <SideElement sideElement={sideElement}>
                    <AiOutlineRight />
                </SideElement> :
                null}
        </ButtonWrapper>
    );
}

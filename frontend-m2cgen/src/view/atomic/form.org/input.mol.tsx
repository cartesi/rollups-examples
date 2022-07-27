import { FC } from "react";
import { Label } from "../typography.mol";
import { SelectWrapper, InputWrapper, InputLayout } from "./form.mol";
import { AiOutlineDown } from "react-icons/ai";

export interface Option {
    id: string;
    name: string;
}

interface IInput
    extends
    React.InputHTMLAttributes<HTMLInputElement>,
    InputLayout
{
    type?: React.HTMLInputTypeAttribute | "select";
    options?: Option[];
    register?: Function
}

export const Input: FC<IInput> = ({
    type,
    options = [],
    register,
    ...other
}) => {
    const idFallback = other.id ?? "";
    const registeredProps = register?.(idFallback);
    return (
        <>
            {other.name ? (
                <Label htmlFor={idFallback ?? ""} color="mediumGray">
                    {other.name}
                </Label>
            ) : null}
            {type === "select" ? (
                <SelectWrapper isOutilined={other.isOutilined}>
                    <select id={idFallback} {...registeredProps}>
                        <option>{undefined}</option>
                        {options.map((embarkedOption) => (
                            <option
                                key={`embarkedOption_${embarkedOption.id}`}
                                value={embarkedOption.id}
                            >
                                {embarkedOption.name}
                            </option>
                        ))}
                    </select>
                    <span>
                        <AiOutlineDown />
                    </span>
                </SelectWrapper>
            ) : (
                <InputWrapper
                    id={idFallback}
                    type={type}
                    {...other}
                    {...registeredProps}
                />
            )}
        </>
    );
}

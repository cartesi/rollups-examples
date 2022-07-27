import { FC } from "react";
import { Label } from "../typography.mol";
import { SelectWrapper, InputWrapper, InputLayout } from "./form.mol";

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
}

export const Input: FC<IInput> = ({
    type,
    options = [],
    ...other
}) => {
    return (
        <>
            {other.name ? (
                <Label htmlFor={other.id ?? ""} color="mediumGray">
                    {other.name}
                </Label>
            ) : null}
            {type === "select" ? (
                <SelectWrapper
                    id={other.id ?? ""}
                    isOutilined={other.isOutilined}
                >
                    {options.map((embarkedOption) => (
                        <option
                            key={`embarkedOption_${embarkedOption.id}`}
                            value={embarkedOption.id}
                        >
                            {embarkedOption.name}
                        </option>
                    ))}
                </SelectWrapper>
            ) : (
                <InputWrapper {...other} />
            )}
        </>
    );
}

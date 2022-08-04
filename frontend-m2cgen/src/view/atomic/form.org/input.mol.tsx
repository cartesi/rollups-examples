import { FC } from "react";
import { Label, Paragraph } from "../typography.mol";
import { SelectWrapper, InputWrapper, InputLayout } from "./form.mol";
import { AiOutlineDown } from "react-icons/ai";
import { handleFormError } from "./helpers";
import { Separator } from "../layout.org/separator.mol/separator.atm";
import { FieldError } from "react-hook-form";

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
    register?: Function;
    inputError?: FieldError;
    handleChange?: (value: string) => void;
}

export const Input: FC<IInput> = ({
    type,
    options = [],
    inputError,
    required,
    register,
    value,
    handleChange,
    ...other
}) => {
    const idFallback = other.id ?? "";
    const registeredProps = register?.(idFallback, { required });

    return (
        <>
            {other.name ? (
                <Label
                    htmlFor={idFallback ?? ""}
                    color={
                        other.variant === "secondary" ? "dark" : "mediumGray"
                    }
                >
                    {other.name}
                    {required ? " *" : null}
                </Label>
            ) : null}
            {type === "select" ? (
                <SelectWrapper
                    isOutilined={other.isOutilined}
                    variant={other.variant}
                >
                    <select
                        id={idFallback}
                        disabled={other.disabled}
                        value={value}
                        onChange={
                            !!handleChange
                                ? (e) => {
                                      handleChange(e.target.value);
                                  }
                                : null
                        }
                        {...registeredProps}
                    >
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
                    value={value}
                    onChange={
                        !!handleChange
                            ? (e) => {
                                  handleChange(e.target.value);
                              }
                            : null
                    }
                    {...other}
                    {...registeredProps}
                />
            )}
            {inputError ? (
                <Paragraph color="white">
                    {handleFormError(inputError, other.name ?? idFallback)}
                </Paragraph>
            ) : null}
        </>
    );
}

// Copyright 2022 Cartesi Pte. Ltd.

// Licensed under the Apache License, Version 2.0 (the "License"); you may not use
// this file except in compliance with the License. You may obtain a copy of the
// License at http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software distributed
// under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
// CONDITIONS OF ANY KIND, either express or implied. See the License for the
// specific language governing permissions and limitations under the License.

import { FC } from "react";
import { Label } from "../typography.mol";
import { SelectWrapper, InputWrapper, InputLayout } from "./form.mol";
import { AiOutlineDown } from "react-icons/ai";
import { InputError } from "./helpers";
import { FieldError } from "react-hook-form";

export interface Option {
    id: string;
    name: string;
}

interface IInput
    extends React.InputHTMLAttributes<HTMLInputElement>,
        InputLayout {
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
    max,
    min,
    handleChange,
    ...other
}) => {
    const idFallback = other.id ?? "";
    const registerValidation = { required, max, min };
    const registeredProps = register?.(idFallback, registerValidation);

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
            <InputError
                error={inputError}
                name={other.name ?? idFallback}
                options={registerValidation}
            />
        </>
    );
};

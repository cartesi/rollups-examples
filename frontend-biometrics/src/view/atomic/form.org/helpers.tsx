// Copyright 2022 Cartesi Pte. Ltd.

// Licensed under the Apache License, Version 2.0 (the "License"); you may not use
// this file except in compliance with the License. You may obtain a copy of the
// License at http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software distributed
// under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
// CONDITIONS OF ANY KIND, either express or implied. See the License for the
// specific language governing permissions and limitations under the License.

import { FC } from "react";
import { RegisterOptions } from "react-hook-form";
import { FieldError } from "react-hook-form/dist/types/errors";
import { Paragraph } from "../typography.mol";

interface IInputError {
    error?: any;
    name: string;
    options: RegisterOptions;
}

export const handleFormError = (
    inputError: FieldError,
    inputName: string,
    options: RegisterOptions
) => {
    const typedKey = inputError.type as keyof typeof options;

    switch (inputError?.type) {
        case "required":
            return `"${inputName}" is required.`;
        case "max":
            return `Max value for "${inputName}" field is ${options[typedKey]}.`;
        case "min":
            return `Min value for "${inputName}" field is ${options[typedKey]}.`;
        default:
            return undefined;
    }
};

export const InputError: FC<IInputError> = ({ error, name, options }) =>
    error ? (
        <Paragraph color="white" paddingX="sm" paddingY="sm">
            {handleFormError(error, name, options)}
        </Paragraph>
    ) : null;

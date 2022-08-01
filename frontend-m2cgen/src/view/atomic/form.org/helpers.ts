import { FieldError } from "react-hook-form/dist/types/errors";

export const handleFormError = (
    inputError: FieldError,
    inputName: string
) => {
    switch (inputError?.type) {
        case "required":
            return `"${inputName}" is required.`;
        default:
            return undefined;
    }
};

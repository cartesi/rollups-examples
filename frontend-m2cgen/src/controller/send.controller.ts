import { Dispatch } from "react";
import { SendInputViewModel, sendInput as sendInputService } from "../service/send.service";
import { ServiceReducerActions } from "./use-service/use-service.hook";

export interface SendInputData {
    Age: number | null;
    Sex: string | null;
    Embarked: string | null;
}

export const sendInput = async (
    dispatch: Dispatch<ServiceReducerActions<SendInputViewModel>>,
    data: SendInputData
) => {
    dispatch({ type: 'start_request' });
    try {
        const sendInputResult = await sendInputService({
            input: JSON.stringify({ ...data, Age: Number(data.Age) })
        });
        dispatch({
            type: 'resolve_request',
            data: sendInputResult
        });
        return sendInputResult;
    } catch (err) {
        dispatch({ type: 'fail_request', error: err });
    }
};

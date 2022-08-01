import { Dispatch } from "react";
import { SendInputViewModel, sendInput as sendInputService } from "../service/send.service";
import { ServiceReducerActions } from "./use-service/use-service.hook";

export interface SendInputData {
    Operation: string;
}

export const sendInput = async (
    dispatch: Dispatch<ServiceReducerActions<SendInputViewModel>>,
    data: SendInputData
) => {
    dispatch({ type: 'start_request' });
    try {
        console.log(data.Operation)
        const sendInputResult = await sendInputService({
            input: data.Operation
            
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
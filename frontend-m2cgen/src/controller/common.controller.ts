import { Dispatch } from "react";
import { ServiceReducerActions } from "./use-service/use-service.hook";

export const resetServiceState = (
    dispatch: Dispatch<ServiceReducerActions<any>>
) => {
    dispatch({ type: 'reset' });
};

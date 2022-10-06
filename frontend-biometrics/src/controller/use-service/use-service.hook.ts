// Copyright 2022 Cartesi Pte. Ltd.

// Licensed under the Apache License, Version 2.0 (the "License"); you may not use
// this file except in compliance with the License. You may obtain a copy of the
// License at http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software distributed
// under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
// CONDITIONS OF ANY KIND, either express or implied. See the License for the
// specific language governing permissions and limitations under the License.

import { Reducer, useReducer } from "react";

enum ServiceReducerAction {
    start_request = "start_request",
    resolve_request = "resolve_request",
    fail_request = "fail_request",
    reset = "reset",
}

export interface UseServiceState<Data, Error = any> {
    data?: Data | null;
    error?: Error | null;
    status?: "idle" | "pending" | "resolved" | "rejected";
}

export interface ServiceReducerActions<Data, Error = any>
    extends UseServiceState<Data> {
    type: keyof typeof ServiceReducerAction;
    propToReset?: keyof UseServiceState<Data, Error>;
}

export const initialState: UseServiceState<any> = {
    data: null,
    error: null,
    status: "idle",
};

const serviceReducer = <Data, Error = any>(
    state: UseServiceState<Data, Error>,
    action: ServiceReducerActions<Data, Error>
): UseServiceState<Data, Error> => {
    switch (action.type) {
        case "start_request":
            return {
                ...state,
                status: action.status ?? "pending",
            };
        case "resolve_request":
            return {
                ...state,
                status: action.status ?? "resolved",
                data: action.data,
                error: null,
            };
        case "fail_request":
            return {
                ...state,
                status: action.status ?? "rejected",
                error: action.error,
            };
        case "reset":
            return {
                ...initialState,
            };
        default:
            throw new Error(`Unhandled action type: ${action.type}`);
    }
};

export const useService = <Data, Error = any>() => {
    const handler = useReducer<
        Reducer<
            UseServiceState<Data, Error>,
            ServiceReducerActions<Data, Error>
        >
    >(serviceReducer, initialState);

    return handler;
};

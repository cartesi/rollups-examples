import { Dispatch } from "react";
import { NoticeKeys } from "../../generated/graphql";
import { getNotices, NoticeViewModel } from "../service/notices.service";
import { genTimerPromise } from "../utils/timer-promise";
import { REFETCH_TIME_DEFAULT } from "./config/constants";
import { ServiceReducerActions } from "./use-service/use-service.hook";

export const fetchNotices = async (
    dispatch: Dispatch<ServiceReducerActions<NoticeViewModel[]>>,
    params?: NoticeKeys,
    refetchIfEmpty?: boolean
) => {
    dispatch({ type: "start_request" });
    try {
        const paramsFallback = params ?? { epoch_index: "0" };
        let fetchedNotices: NoticeViewModel[] = await getNotices(paramsFallback);

        if (refetchIfEmpty) while (!fetchedNotices.length) {
            await genTimerPromise(REFETCH_TIME_DEFAULT);
            const refetch = await getNotices(paramsFallback, true);
            fetchedNotices = refetch;
        }

        dispatch({ type: "resolve_request", data: fetchedNotices });

        return fetchedNotices;
    } catch (err) {
        dispatch({ type: "fail_request", error: err });
    }
};

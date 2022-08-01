import { Dispatch } from "react";
import { getNotices, NoticeViewModel } from "../../service/notices.service";
import { ServiceReducerActions } from "./use-service.hook";

export const fetchNotices = async (
    dispatch: Dispatch<ServiceReducerActions<NoticeViewModel[]>>
) => {
    dispatch({ type: 'start_request' })
    try {
        const fetchedNotices = await getNotices({ epoch_index: "0" });
        dispatch({type: 'resolve_request', data: fetchedNotices})
    } catch (err) {
        dispatch({ type: 'fail_request', error: err })
    }
};
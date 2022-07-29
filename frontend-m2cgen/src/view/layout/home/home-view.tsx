import { FC } from "react";
import { fetchNotices } from "../../../controller/notices.controller";
import { SendInputData, sendInput } from "../../../controller/send.controller";
import { useService } from "../../../controller/use-service/use-service.hook";
import { NoticeViewModel } from "../../../service/notices.service";
import { SendInputViewModel } from "../../../service/send.service";
import { SharedLayout } from "../shared/shared-layout";
import { SendInputForm } from "./send-input.form";
import { Row } from "react-grid-system";
import { FeedbackBoard } from "./feedback.board";
import { toast } from "react-toast";
import { string } from "./constants";
import { resetServiceState } from "../../../controller/common.controller";

export const HomeView: FC = () => {
    const [noticesState, noticesDispatch] = useService<NoticeViewModel[]>();
    const [sendInputState, sendInputDispatch] =
        useService<SendInputViewModel>();
    const handleSendInput = (data: SendInputData) => {
        toast.info(string.sendInputFeedback.requestStarted);
        sendInput(sendInputDispatch, data)
            .then((result) =>
                fetchNotices(
                    noticesDispatch,
                    {
                        epoch_index: result?.epochNumber,
                        input_index: result?.inputIndex,
                    },
                    true
                )
                    .then(() =>
                        toast.success(string.fetchNoticesFeedback.onSucess)
                    )
                    .catch(() =>
                        toast.error(string.fetchNoticesFeedback.onError)
                    )
            )
            .catch(() => toast.error(string.sendInputFeedback.onError));
    };
    const handleResetStates = () => {
        resetServiceState(noticesDispatch);
        resetServiceState(sendInputDispatch);
    };
    console.log({sendInputState, noticesState});

    return (
        <SharedLayout>
            <Row>
                <SendInputForm
                    handleSendInput={handleSendInput}
                    onClearForm={handleResetStates}
                    isLoading={
                        sendInputState.status === "pending" ||
                        noticesState.status === "pending"
                    }
                    canClearForm={
                        sendInputState.status === "resolved" &&
                        noticesState.status === "resolved"
                    }
                />
                <FeedbackBoard
                    data={noticesState.data ?? []}
                    status={noticesState.status}
                />
            </Row>
        </SharedLayout>
    );
}

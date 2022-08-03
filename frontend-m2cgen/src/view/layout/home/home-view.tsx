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
import { useOnboardedService } from "../../../controller/use-service/use-onboarded-service";

export const HomeView: FC = () => {
    const [noticesState, noticesDispatch] = useService<NoticeViewModel[]>();
    const [sendInputState, sendInputDispatch] =
        useOnboardedService<SendInputViewModel>();
    const handleSendInput = (data: SendInputData) => {
        if (sendInputState.chain) {
            toast.info(string.sendInputFeedback.requestStarted);
            sendInput(
                sendInputDispatch,
                data,
                sendInputState.chain?.id,
                sendInputState.wallet.provider
            )
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
        } else toast.error(
            string.sendInputFeedback.web3OnboardError
        );
    };
    const handleResetStates = () => {
        resetServiceState(noticesDispatch);
        resetServiceState(sendInputDispatch);
    };

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

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
import { ToastContainer, toast } from "react-toast";
import { string } from "./constants";


export const HomeView: FC = () => {
    const [noticesState, noticesDispatch] = useService<NoticeViewModel[]>();
    const [sendInputState, sendInputDispatch] =
        useService<SendInputViewModel>();

    const handleSendInput = (data: SendInputData) => {
        toast.info(string.sendInputFeedback.requestStarted);
        sendInput(sendInputDispatch, data).then((result) =>
            fetchNotices(
                noticesDispatch,
                {
                    epoch_index: result?.epochNumber,
                    input_index: result?.inputIndex,
                },
                true
            ).then(()=> toast.success(string.sendInputFeedback.onSucess))
        );
    };

    return (
        <SharedLayout>
            <Row>
                <SendInputForm handleSendInput={handleSendInput} />
                <FeedbackBoard data={noticesState.data ?? []} />
            </Row>
            <ToastContainer position="bottom-center" delay={5000} />
        </SharedLayout>
    );
}

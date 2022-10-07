import { FC, useCallback } from "react";
import { Row } from "react-grid-system";
import { resetServiceState } from "../../../controller/common.controller";
import { fetchNotices } from "../../../controller/notices.controller";
import { sendInput, SendInputData } from "../../../controller/send.controller";
import { useOnboardedService } from "../../../controller/use-service/use-onboarded-service.hook";
import { useService } from "../../../controller/use-service/use-service.hook";
import { NoticeViewModel } from "../../../service/notices.service";
import { SendInputViewModel } from "../../../service/send.service";
import { SharedLayout } from "../shared/shared-layout";
import { BiometricsGalleryBoard, GalleryItem } from "./biometrics-gallery/biometrics-gallery.board";
import { string } from "./constants";
import { toast } from "react-toast";
import { handleGalleryInput } from "./helpers/send-input.helpers";

export const HomeView: FC = () => {
    const [noticesState, noticesDispatch] = useService<NoticeViewModel[]>();
    const [sendInputState, sendInputDispatch] =
        useOnboardedService<SendInputViewModel>();

    const handleSendInput = useCallback(
        async (data: SendInputData, shouldAvoidNotices = false) => {
            if (sendInputState.chain) {
                toast.info(string.sendInputFeedback.requestStarted);
                try {
                    const sendResult = await sendInput(
                        sendInputDispatch,
                        data,
                        sendInputState.chain?.id,
                        sendInputState.wallet.provider
                    );
                    if (!shouldAvoidNotices) {
                        await fetchNotices(
                            noticesDispatch,
                            {
                                epoch_index: sendResult?.epochNumber ?? 0,
                                input_index: sendResult?.inputIndex ?? 0,
                            },
                            true
                        );
                        toast.success(string.fetchNoticesFeedback.onSucess);
                    }
                } catch (err) {
                    toast.error(string.sendInputFeedback.onError);
                }
            }
        },
        [sendInputState.chain, sendInputState.wallet]
    );
    const handleSelectItem = useCallback(
        (item: GalleryItem) => {
            if (sendInputState.chain)
                handleGalleryInput(item, handleSendInput);
            else toast.error(string.sendInputFeedback.web3OnboardError);
        },
        [sendInputState.chain, handleSendInput]
    );
    const handleResetStates = () => {
        resetServiceState(noticesDispatch);
        resetServiceState(sendInputDispatch);
    };

    return (
        <SharedLayout>
            <Row>
                <BiometricsGalleryBoard
                    handleSelectItem={handleSelectItem}
                    isLoading={false}
                />
            </Row>
        </SharedLayout>
    );
}

import { FC } from "react";
import { Col, Row } from "react-grid-system";
import { NoticeViewModel } from "../../../service/notices.service";
import { BoxWrapper } from "../../atomic/layout.org/layout.mol";
import { H1, H4 } from "../../atomic/typography.mol";
import { string } from "./constants";
import { UseServiceState } from "../../../controller/use-service/use-service.hook";
import { onboardTourCSSClass } from "./onboard-tour/onboard-tour.style";
import { motion } from "framer-motion";
import { Image } from "../../atomic/image.mol/image.mol";
import fingerprintFail from "../../../assets/img/feedback/fingerprint_fail.svg";
import fingerprintOk from "../../../assets/img/feedback/fingerprint_ok.svg";

interface IFeedbackBoard {
    data: NoticeViewModel[];
    status: UseServiceState<any>["status"];
}

const boardString = string.resultPreview;

export const FeedbackBoard: FC<IFeedbackBoard> = ({ data, status }) => {
    const handleResult = (
        currentData: typeof data,
        currentStatus: typeof status
    ) => {
        if (currentStatus !== "resolved" && !data?.length)
            return { message: null };

        const notice = currentData[0];

        //TODO: adjust message
        const message = `Your result is: ${notice.payload_parsed}!`;
        const isFake = notice.payload_parsed.toLowerCase() === "fake";
        const img = isFake ? fingerprintFail : fingerprintOk;
        return { message, img };
    };
    const { message, img } = handleResult(data, status);

    return (
        <Col sm={12} md={6}>
            <BoxWrapper
                className={onboardTourCSSClass["onboard-tour-element-3"]}
                isFluid
                shouldMaxSize
            >
                <Row justify="end">
                    <Col xs="content">
                        <H4 color="lightMain">{boardString.title}</H4>
                    </Col>
                </Row>
                {status === "pending" ? (
                    <Row justify="center">
                        <Col xs="content">
                            <H1 color="sweetMain" justify="center">
                                {boardString.pendingFeedback}
                            </H1>
                        </Col>
                    </Row>
                ) : (
                    <>
                        <Row justify="center">
                            <Col xs="content">
                                {status === "idle" || status === "rejected" ? (
                                    <>
                                        <H1 color="sweetMain" justify="center">
                                            {boardString.idleFeedback}
                                        </H1>
                                        <H4 color="sweetMain" justify="center">
                                            {boardString.idleFeedbackComplement}
                                        </H4>
                                    </>
                                ) : null}
                                {message ? (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.5 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{
                                            duration: 0.8,
                                            delay: 0.5,
                                            ease: [0, 0.71, 0.2, 1.01],
                                        }}
                                    >
                                        <Image
                                            src={img}
                                            justify="center"
                                            size="lg"
                                        />
                                        <H1
                                            color="sweetMain"
                                            justify="center"
                                            isBold
                                        >
                                            {message}
                                        </H1>
                                    </motion.div>
                                ) : null}
                            </Col>
                        </Row>
                    </>
                )}
            </BoxWrapper>
        </Col>
    );
};

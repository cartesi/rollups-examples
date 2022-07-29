import { FC } from "react";
import { Col, Row } from "react-grid-system";
import { NoticeViewModel } from "../../../service/notices.service";
import { BoxWrapper } from "../../atomic/layout.org/layout.mol";
import { H1, H2, H4 } from "../../atomic/typography.mol";
import { string } from "./constants";
import SkullImgSVG from "../../../assets/img/skull.svg";
import CelebrationImgSVG from "../../../assets/img/celebration.svg";
import { UseServiceState } from "../../../controller/use-service/use-service.hook";
import { Image } from "../../atomic/image.mol/image.mol";
import { ShipCrashAnimation } from "./ship-crash/ship-crash.animation";

interface IFeedbackBoard {
    data: NoticeViewModel[],
    status: UseServiceState<any>['status']
}

const boardString = string.resultPreview;

export const FeedbackBoard: FC<IFeedbackBoard> = ({
    data,
    status
}) => {
    const handleResult = (
        currentData: typeof data,
        currentStatus: typeof status
    ) => {

        if (
            currentStatus !== 'resolved' &&
            !data?.length
        ) return { img: null, message: null };

        const notice = currentData[0];
        const isSurvived = notice.payload_parsed === "1";
        const message = isSurvived ?
            boardString.survivedFeeback : boardString.sankFeedback;
        const img = isSurvived ? CelebrationImgSVG : SkullImgSVG;

        return { message, img };
    };
    const { img, message } = handleResult(data, status);

    return (
        <Col sm={12} md={6}>
            <BoxWrapper isFluid>
                {status === "pending" ? (
                    <>
                        <Row>
                            <Col>
                                <H2 color="sweetMain" justify="center">
                                    {boardString.pendingFeedback}
                                </H2>
                            </Col>
                        </Row>
                        <ShipCrashAnimation />
                    </>
                ) : (
                    <>
                        <Row justify="end">
                            <Col xs="content">
                                <H4 color="lightMain">{boardString.title}</H4>
                            </Col>
                        </Row>
                        <Row justify="center">
                            <Col xs="content">
                                {status === "idle" || status === "rejected" ? (
                                    <H1 color="sweetMain" justify="center">
                                        {boardString.idleFeedback}
                                    </H1>
                                ) : null}
                                {img ? (
                                    <Image
                                        src={img}
                                        justify="center"
                                        size="lg"
                                    />
                                ) : null}
                                {message ? (
                                    <H1
                                        color="sweetMain"
                                        justify="center"
                                        isBold
                                    >
                                        {message}
                                    </H1>
                                ) : null}
                            </Col>
                        </Row>
                    </>
                )}
            </BoxWrapper>
        </Col>
    );
};

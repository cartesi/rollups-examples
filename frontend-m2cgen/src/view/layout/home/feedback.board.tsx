import { FC } from "react";
import { Col } from "react-grid-system";
import { NoticeViewModel } from "../../../service/notices.service";

interface IFeedbackBoard {
    data: NoticeViewModel[]
}

export const FeedbackBoard: FC<IFeedbackBoard> = ({
    data
}) => {
    const handleResult = (currentData: typeof data) => {
        const notice = currentData[0];
        const message =
            notice.payload_parsed === "1" ? "You survived!" : "You sank...";

        return message;
    };

    return (
        <Col sm={6}>
            <h1>Hello world</h1>
            {!!data?.length ? <h2>{handleResult(data)}</h2> : null}
        </Col>
    );
};

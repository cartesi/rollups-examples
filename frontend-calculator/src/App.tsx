import styled from "styled-components";
import { fetchNotices } from "./controller/notices.controller";
import { sendInput, SendInputData } from "./controller/send.controller";
import { useService } from "./controller/use-service/use-service.hook";
import { NoticeViewModel } from "./service/notices.service";
import { SendInputViewModel } from "./service/send.service";

export const App = () => {
    const [ noticesState, noticesDispatch ] = useService<NoticeViewModel[]>();
    const [ sendInputState, sendInputDispatch ] = useService<SendInputViewModel>();

    const handleResult = (notices: NoticeViewModel[]) => {
        const notice = notices[0];
        const message = notice.payload_parsed;

        return <h2>{message}</h2>;
    }

    const handleSendInput = (e: any) => {
        e.preventDefault()
        const form = e.target;
        const elementsKeys = Object.keys(form);
        let data: SendInputData = {
            Operation: null
        }
        elementsKeys
            .filter((key) => !!form[key]?.value)
            .forEach((key) => {
                const { id, value } = form[key]
                const parsedId: keyof typeof data = id.replace('Input', '')
                data[parsedId] = value;
            });
        console.log(data)
        sendInput(sendInputDispatch, data).then((result) =>
            fetchNotices(noticesDispatch, {
                epoch_index: result?.epochNumber,
                input_index: result?.inputIndex,
            }, true)
        );
    }

    return (
        <AppWrapper>
            <Heading>Calculator</Heading>
            {!!noticesState.data?.length ? (
                handleResult(noticesState.data)
            ) : null}
            <div>
                <form
                    onSubmit={handleSendInput}
                    style={{ display: "flex", flexDirection: "column" }}
                >
                    <label>Operation</label>
                    <input id="OperationInput" type="text" />
                    <button type="submit">Send</button>
                </form>
            </div>
        </AppWrapper>
    );
};

const AppWrapper = styled.div``;
const Heading = styled.h1`
    color: red;
`;
import styled from "styled-components";
import { fetchNotices } from "./controller/notices.controller";
import { sendInput, SendInputData } from "./controller/send.controller";
import { useService } from "./controller/use-service/use-service.hook";
import { NoticeViewModel } from "./service/notices.service";
import { SendInputViewModel } from "./service/send.service";

export const App = () => {
    const [noticesState, noticesDispatch] = useService<NoticeViewModel[]>();
    const [sendInputState, sendInputDispatch] =
        useService<SendInputViewModel>();

    const handleResult = (notices: NoticeViewModel[]) => {
        const notice = notices[0];
        const message = `You got a ${notice.payload_parsed}!`;

        return <h2>{message}</h2>;
    };

    const handleSendInput = (e: any) => {
        e.preventDefault();
        const form = e.target;
        const elementsKeys = Object.keys(form);
        let data: SendInputData = {
            pl: 0,
            pw: 0,
            sl: 0,
            sw: 0
        };
        elementsKeys
            .filter((key) => !!form[key]?.value)
            .forEach((key) => {
                const { id, value } = form[key];
                const parsedId: keyof typeof data = id.replace("Input", "");
                data[parsedId] = value;
            });
        sendInput(sendInputDispatch, data).then((result) =>
            fetchNotices(
                noticesDispatch,
                {
                    epoch_index: result?.epochNumber,
                    input_index: result?.inputIndex,
                },
                true
            )
        );
    };
    console.log({noticesState, sendInputState});

    return (
        <div>
            <h1>Hello world</h1>
            {!!noticesState.data?.length
                ? handleResult(noticesState.data)
                : null}
            <div>
                <form
                    onSubmit={handleSendInput}
                    style={{ display: "flex", flexDirection: "column" }}
                >
                    <label htmlFor="plInput">Petal length</label>
                    <input id="plInput" type="number" />
                    <label htmlFor="pwInput">Petal width</label>
                    <input id="pwInput" type="number" />
                    <label htmlFor="slInput">Sepal length</label>
                    <input id="slInput" type="number" />
                    <label htmlFor="swInput">Sepal width</label>
                    <input id="swInput" type="number" />

                    <button type="submit">Send</button>
                </form>
            </div>
        </div>
    );
};

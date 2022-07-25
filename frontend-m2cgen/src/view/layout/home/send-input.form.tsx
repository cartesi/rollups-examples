import { FC, useCallback } from "react";
import { Col } from "react-grid-system";
import { SendInputData } from "../../../controller/send.controller";

interface ISendInputForm {
    handleSendInput: (data: SendInputData)=> void
}

export const SendInputForm: FC<ISendInputForm> = ({ handleSendInput }) => {
    const handleInputData = useCallback((e: any) => {
        e.preventDefault();
        const form = e.target;
        const elementsKeys = Object.keys(form);
        let data: SendInputData = {
            Age: null,
            Embarked: null,
            Sex: null,
        };
        elementsKeys
            .filter((key) => !!form[key]?.value)
            .forEach((key) => {
                const { id, value } = form[key];
                const parsedId: keyof typeof data = id.replace("Input", "");
                data[parsedId] = value;
            });
        handleSendInput(data);
    },[handleSendInput]);

    return (
        <Col sm={6}>
            <form
                onSubmit={handleInputData}
                style={{ display: "flex", flexDirection: "column" }}
            >
                <label htmlFor="ageInput">Age</label>
                <input id="AgeInput" type="number" />
                <label>Sex</label>
                <input id="SexInput" type="text" />
                <label>Embark</label>
                <input id="EmbarkedInput" type="text" />
                <button type="submit">Send</button>
            </form>
        </Col>
    );
};

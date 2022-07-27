import { FC, useCallback } from "react";
import { Col, Row } from "react-grid-system";
import { SendInputData } from "../../../controller/send.controller";
import { FieldsetWrapper, FormWrapper } from "../../atomic/form.org/form.mol";
import { Input, Option } from "../../atomic/form.org/input.mol";
import { Separator } from "../../atomic/layout.org/separator.mol/separator.atm";
import { H1, Label, Paragraph } from "../../atomic/typography.mol";
import { brandName, id, string } from "./constants";

interface ISendInputForm {
    handleSendInput: (data: SendInputData)=> void
}

const options: Option[] = [
    { id: "C", name: "Cherbourg" },
    { id: "Q", name: "Queenstown" },
    { id: "S", name: "Southampton" }
];

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
            <H1>{brandName}</H1>
            <Paragraph color="gray">
                {string.sendInputForm.description}
            </Paragraph>
            <Separator />
            <FormWrapper id={id.sendInputForm.main} onSubmit={handleInputData}>
                <Row>
                    <Col>
                        <FieldsetWrapper form={id.sendInputForm.main}>
                            <Input
                                id={id.sendInputForm.ageInput}
                                name={string.sendInputForm.ageInputText}
                                type="number"
                                isOutilined
                            />
                        </FieldsetWrapper>
                    </Col>
                    <Col>
                        <FieldsetWrapper form={id.sendInputForm.main}>
                            <Input
                                id={id.sendInputForm.sexInput}
                                name={string.sendInputForm.sexInputText}
                                type="text"
                                isOutilined
                            />
                        </FieldsetWrapper>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <FieldsetWrapper form={id.sendInputForm.main}>
                            <Input
                                name={string.sendInputForm.embarkedInputText}
                                id={id.sendInputForm.embarkedInput}
                                options={options}
                                type="select"
                                isOutilined
                            />
                        </FieldsetWrapper>
                    </Col>
                </Row>
                <button type="submit">
                    {string.sendInputForm.submitButtonText}
                </button>
            </FormWrapper>
        </Col>
    );
};

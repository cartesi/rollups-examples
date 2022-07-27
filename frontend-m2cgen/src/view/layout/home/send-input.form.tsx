import { FC } from "react";
import { Col, Row } from "react-grid-system";
import { useForm } from "react-hook-form";
import { SendInputData } from "../../../controller/send.controller";
import { Button } from "../../atomic/button.mol/button.mol";
import { FieldsetWrapper, FormWrapper } from "../../atomic/form.org/form.mol";
import { Input, Option } from "../../atomic/form.org/input.mol";
import { Separator } from "../../atomic/layout.org/separator.mol/separator.atm";
import { H1, Paragraph } from "../../atomic/typography.mol";
import { brandName, id, string } from "./constants";

interface ISendInputForm {
    handleSendInput: (data: SendInputData)=> void
}

const sexOptions: Option[] = [
    { id: "female", name: "Female" },
    { id: "male", name: "Male" }
]

const embarkedOptions: Option[] = [
    { id: "C", name: "Cherbourg" },
    { id: "Q", name: "Queenstown" },
    { id: "S", name: "Southampton" }
];

export const SendInputForm: FC<ISendInputForm> = ({ handleSendInput }) => {
    const { handleSubmit, register } = useForm<SendInputData>();
    return (
        <Col sm={6}>
            <H1>{brandName}</H1>
            <Paragraph color="gray">
                {string.sendInputForm.description}
            </Paragraph>
            <Separator />
            <FormWrapper
                id={id.sendInputForm.main}
                onSubmit={handleSubmit(handleSendInput)}
            >
                <Row>
                    <Col>
                        <FieldsetWrapper form={id.sendInputForm.main}>
                            <Input
                                id={id.sendInputForm.ageInput}
                                name={string.sendInputForm.ageInputText}
                                register={register}
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
                                register={register}
                                options={sexOptions}
                                type="select"
                                isOutilined
                            />
                        </FieldsetWrapper>
                    </Col>
                </Row>
                <Separator />
                <Row>
                    <Col>
                        <FieldsetWrapper form={id.sendInputForm.main}>
                            <Input
                                id={id.sendInputForm.embarkedInput}
                                name={string.sendInputForm.embarkedInputText}
                                register={register}
                                options={embarkedOptions}
                                type="select"
                                isOutilined
                            />
                        </FieldsetWrapper>
                    </Col>
                </Row>
                <Separator large />
                <Row>
                    <Col>
                        <Button
                            form={id.sendInputForm.main}
                            type="submit"
                            sideElement="right"
                        >
                            {string.sendInputForm.submitButtonText}
                        </Button>
                    </Col>
                </Row>
            </FormWrapper>
        </Col>
    );
};

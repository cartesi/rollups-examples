import { FC, useCallback } from "react";
import { Col, Hidden, Row, Visible } from "react-grid-system";
import { useForm } from "react-hook-form";
import { SendInputData } from "../../../controller/send.controller";
import { Button } from "../../atomic/button.mol/button.mol";
import { FieldsetWrapper, FormWrapper } from "../../atomic/form.org/form.mol";
import { Input, Option } from "../../atomic/form.org/input.mol";
import { Separator } from "../../atomic/layout.org/separator.mol/separator.atm";
import { H1, Paragraph } from "../../atomic/typography.mol";
import { brandName, id, string } from "./constants";

interface ISendInputForm {
    handleSendInput: (data: SendInputData) => void,
    onClearForm: () => void
    isLoading: boolean,
    canClearForm: boolean,
}

const sexOptions: Option[] = [
    { id: "female", name: "Female" },
    { id: "male", name: "Male" }
];

const embarkedOptions: Option[] = [
    { id: "C", name: "Cherbourg" },
    { id: "Q", name: "Queenstown" },
    { id: "S", name: "Southampton" }
];

const formString = string.sendInputForm;

export const SendInputForm: FC<ISendInputForm> = ({
    handleSendInput,
    onClearForm,
    isLoading,
    canClearForm

}) => {
    const { handleSubmit, register, formState, clearErrors, reset } = useForm<SendInputData>();
    const handleClearForm = useCallback((e: any) => {
        e.preventDefault();
        onClearForm();
        clearErrors();
        reset();
    }, [onClearForm, clearErrors, reset])
    const renderSubmitButton = useCallback(() => {
        return (
            <>
                <Col xs="content">
                    {canClearForm ? (
                        <Button
                            form={id.sendInputForm.main}
                            type="reset"
                            onClick={handleClearForm}
                        >
                            {formString.clearButtonText}
                        </Button>
                    ) : (
                        <Button
                            form={id.sendInputForm.main}
                            type="submit"
                            sideElement="right"
                            disabled={isLoading}
                        >
                            {isLoading
                                ? formString.loadingButtonText
                                : formString.submitButtonText}
                        </Button>
                    )}
                </Col>
            </>
        );
    }, [canClearForm, handleClearForm, isLoading])

    return (
        <Col sm={12} md={6}>
            <H1>{brandName}</H1>
            <Paragraph color="gray">{formString.description}</Paragraph>
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
                                name={formString.ageInputText}
                                register={register}
                                inputError={formState.errors.Age}
                                type="number"
                                isOutilined
                                required
                            />
                        </FieldsetWrapper>
                    </Col>
                    <Col>
                        <FieldsetWrapper form={id.sendInputForm.main}>
                            <Input
                                id={id.sendInputForm.sexInput}
                                name={formString.sexInputText}
                                register={register}
                                options={sexOptions}
                                inputError={formState.errors.Sex}
                                type="select"
                                isOutilined
                                required
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
                                name={formString.embarkedInputText}
                                register={register}
                                options={embarkedOptions}
                                inputError={formState.errors.Embarked}
                                type="select"
                                isOutilined
                                required
                            />
                        </FieldsetWrapper>
                    </Col>
                </Row>
                <Separator large />
                <Visible xs sm>
                    <Row justify="center">{renderSubmitButton()}</Row>
                </Visible>
                <Hidden xs sm>
                    <Row>{renderSubmitButton()}</Row>
                </Hidden>
            </FormWrapper>
            <Visible xs sm>
                <Separator />
            </Visible>
        </Col>
    );
};

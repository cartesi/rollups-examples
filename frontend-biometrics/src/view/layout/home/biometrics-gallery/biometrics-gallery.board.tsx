import { FC, useEffect, useState } from "react";
import { Col, Row } from "react-grid-system";
import { brandName } from "../../../../config/constants";
import { Button } from "../../../atomic/button.mol/button.mol";
import { Image } from "../../../atomic/image.mol/image.mol";
import { Card } from "../../../atomic/layout.org/card.atm";
import { Modal } from "../../../atomic/layout.org/modal.mol/modal.mol";
import { Separator } from "../../../atomic/layout.org/separator.mol/separator.atm";
import { H1, H2, Paragraph } from "../../../atomic/typography.mol";
import { string } from "../constants";
import { GalleryWrapper, ItemsWrapper } from "./biometrics-gallery.style";
import { getGalleryItems } from "./helpers";

const galleryStrings = string.biometricsGallery;

export enum BiometricsType {
    fake = "fake",
    live = "live"
}

export interface GalleryItem {
    id: string;
    imgUrl: string;
    type: keyof typeof BiometricsType;
}

interface IBiometricsGalleryBoard {
    handleSelectItem: (item: GalleryItem) => void;
    onClearResult: () => void;
    isLoading: boolean;
    canClearResult: boolean;
}

export const BiometricsGalleryBoard: FC<IBiometricsGalleryBoard> = ({
    handleSelectItem,
    onClearResult,
    canClearResult,
    isLoading
}) => {
    const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
    const [selectedItem, setSelectedItem] = useState<GalleryItem>();

    const handleClick = (item: GalleryItem) => setSelectedItem(item);
    const handleConfirm = (item: GalleryItem) => {
        handleSelectItem(item);
        setSelectedItem(undefined);
    };
    const handleCancel = () => setSelectedItem(undefined);

    useEffect(() => {
        getGalleryItems()
            .then(result => {
                setGalleryItems(result);
            })
    }, [])

    return (
        <>
            <Modal isOpen={!!selectedItem} onClose={handleCancel}>
                {!!selectedItem ? (
                    <>
                        <Row justify="center">
                            <Col md={6}>
                                <H2 justify="center" color="dark" isBold>
                                    {galleryStrings.confirmationTitle}
                                </H2>
                            </Col>
                        </Row>
                        <Row justify="center">
                            <Col xs={6} sm={4} lg={3}>
                                <Image src={selectedItem.imgUrl} size="md" />
                                <Separator />
                                <Paragraph color="dark" noPadding>
                                    {`${galleryStrings.confirmationIdLabel} ${selectedItem.id}`}
                                </Paragraph>
                                <Paragraph color="dark" noPadding>
                                    {`${galleryStrings.confirmationTypeLabel} ${selectedItem.type}`}
                                </Paragraph>
                                <Separator />
                                <Button
                                    onClick={() => handleConfirm(selectedItem)}
                                    variant="secondary"
                                >
                                    {galleryStrings.confirmationCTA}
                                </Button>
                            </Col>
                        </Row>
                    </>
                ) : null}
            </Modal>
            <GalleryWrapper sm={12} md={6}>
                <H1>{brandName}</H1>
                <Paragraph color="gray">{galleryStrings.description}</Paragraph>
                <Separator />
                <ItemsWrapper>
                    {galleryItems.map((item) => (
                        <Col key={item.id} xs={6} sm={4} lg={3}>
                            <Card
                                aria-disabled={isLoading}
                                onClick={() =>
                                    isLoading ? null : handleClick(item)
                                }
                            >
                                <Image
                                    src={item.imgUrl}
                                    description={item.type}
                                    options={{ textColor: "dark" }}
                                />
                            </Card>
                            <Separator />
                        </Col>
                    ))}
                </ItemsWrapper>
                {canClearResult ? (
                    <>
                        <Separator />
                        <Row justify="center">
                            {canClearResult ? (
                                <Col xs="content" sm={6}>
                                    <Button onClick={onClearResult}>
                                        {galleryStrings.clearResultButtonText}
                                    </Button>
                                </Col>
                            ) : null}
                        </Row>
                        <Separator />
                    </>
                ) : null}
            </GalleryWrapper>
        </>
    );
};

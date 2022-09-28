import { FC } from "react";
import { Col } from "react-grid-system";
import { brandName } from "../../../config/constants";
import { Separator } from "../../atomic/layout.org/separator.mol/separator.atm";
import { H1, Paragraph } from "../../atomic/typography.mol";
import { string } from "./constants";

const galleryStrings = string.biometricsGallery;

interface GalleryItem {
    id: string;
    imgUrl: string;
}

interface IBiometricsGalleryBoard {
    handleSendInput?: (item: GalleryItem) => void;
    isLoading: boolean;
}

export const BiometricsGalleryBoard: FC<IBiometricsGalleryBoard> = () => {
    return (
        <Col sm={12} md={6}>
            <H1>{brandName}</H1>
            <Paragraph color="gray">
                {galleryStrings.description}
            </Paragraph>
            <Separator/>
        </Col>
    );
}

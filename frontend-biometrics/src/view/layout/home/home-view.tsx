import { FC } from "react";
import { Row } from "react-grid-system";
import { SharedLayout } from "../shared/shared-layout";
import { BiometricsGalleryBoard, GalleryItem } from "./biometrics-gallery/biometrics-gallery.board";

export const HomeView: FC = () => {
    const handleSendInput = (data: GalleryItem) => {
        console.log({data});
    }
    return (
        <SharedLayout>
            <Row>
                <BiometricsGalleryBoard
                    handleSendInput={handleSendInput}
                    isLoading={false}
                />
            </Row>
        </SharedLayout>
    )
}

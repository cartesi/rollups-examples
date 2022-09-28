import { FC } from "react";
import { Row } from "react-grid-system";
import { SharedLayout } from "../shared/shared-layout";
import { BiometricsGalleryBoard } from "./biometrics-gallery.board";

export const HomeView: FC = () => {
    return (
        <SharedLayout>
            <Row>
                <BiometricsGalleryBoard
                    handleSendInput={(d) => { console.log(d) }}
                    isLoading={false}
                />
            </Row>
        </SharedLayout>
    )
}

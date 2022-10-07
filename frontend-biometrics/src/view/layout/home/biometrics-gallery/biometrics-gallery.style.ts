import { Col, Row } from "react-grid-system";
import styled from "styled-components";

export const GalleryWrapper = styled(Col)`
    max-height: 34rem;

    @media only screen and (min-width: 576px) {
        max-height: 24rem;
    }
    @media only screen and (min-width: 768px) {
        max-height: 38rem;
    }
    @media only screen and (min-width: 1200px) {
        max-height: 30rem;
    }
`;
export const ItemsWrapper = styled(Row)`
    overflow: auto;
    max-height: 56%;

    @media only screen and (min-width: 576px) {
        max-height: 52%;
    }
    @media only screen and (min-width: 768px) {
        max-height: 48%;
    }
    @media only screen and (min-width: 1200px) {
        max-height: 64%;
    }
`;

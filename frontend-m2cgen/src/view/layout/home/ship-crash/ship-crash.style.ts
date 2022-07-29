import { Col, Row } from "react-grid-system";
import styled from "styled-components";
import { linearGradient, radius, zIndex } from "../../../atomic/styleguide.atm";

export const ShipCrashAnimationWrapper = styled(Row)`
    position: relative;
    height: 100%;
`;
export const ShipCrashAnimationBoard = styled(Col)`
    display: flex;
    align-items: center;
    justify-content: center;
`;
export const OceanWrapper = styled.div`
    z-index: ${zIndex.veryLow};
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: ${radius.md};
    background: ${linearGradient.ocean};
    background-position: bottom;
    background-size: 100% 50%;
    background-repeat: no-repeat;
`;

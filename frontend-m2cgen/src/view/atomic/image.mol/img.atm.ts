import styled from "styled-components";
import { size as sizeConstant } from "../styleguide.atm";

export interface ImageLayout {
    justify?: "start" | "center" | "end",
    size?: "sm" | "md" | "lg"
}

export const ImageWrapper = styled.div<ImageLayout>`
    display: flex;
    justify-content: ${({ justify }) =>
        justify === 'center' ? justify : `flex-${justify}` };
    width: auto;
    height: ${({size})=> sizeConstant.image[size ?? 'md']};
`;

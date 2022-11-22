import { SendInputData } from "../../../../controller/send.controller";
import { convertArrayBufferToBase64 } from "../../../../utils/array-buffer-to-base64-conversor";
import { GalleryItem } from "../biometrics-gallery/biometrics-gallery.board";

export const handleGalleryInput = async (
    data: GalleryItem,
    requestHandler: (
        data: SendInputData,
        shouldAvoidNotices: boolean
    ) => Promise<void>
) => {
    const maxChunkLength = 50000;
    const getImage = await fetch(data.imgUrl);
    const result = await getImage.arrayBuffer();

    const convertedResult = convertArrayBufferToBase64(result);
    const chunksCount = Math.ceil(convertedResult.length / maxChunkLength);
    let currentChunkStart = 0;
    let currentChunkEnd = maxChunkLength;

    for (let idx = 0; idx < chunksCount; idx++) {
        const content = convertedResult.slice(
            currentChunkStart,
            currentChunkEnd
        );
        const isFirstIteration = idx === 0;
        const isLastIteration = currentChunkEnd > convertedResult.length;
        const sendInputData: SendInputData = {
            chunk: isFirstIteration
                ? "initial"
                : isLastIteration
                ? "final"
                : idx + 1,
            imageId: data.id,
            content,
        };
        const shouldAvoidNotices = sendInputData.chunk !== "final";

        await requestHandler(sendInputData, shouldAvoidNotices);

        currentChunkStart = currentChunkEnd;
        if (isLastIteration) currentChunkEnd = convertedResult.length;
        else currentChunkEnd += maxChunkLength;
    }
};

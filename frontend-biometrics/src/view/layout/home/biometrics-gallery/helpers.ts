import { BiometricsType, GalleryItem } from "./biometrics-gallery.board";

export const getGalleryItems = async (): Promise<GalleryItem[]> => {
    let galleryItems: GalleryItem[] = [];
    const basePath = "../../../../assets/img/biometrics";
    const getImgUrl = (type: string, index: string) =>
        import(/* @vite-ignore */ `${basePath}/${type}_${index}.png`);
    const biometricsTypes = Object.keys(BiometricsType);
    const fakeArray = Array.from({ length: 5 });

    await Promise.all(
        biometricsTypes.map(async (typeName) => {
            const typedTypeName = typeName as keyof typeof BiometricsType;
            await Promise.all(
                fakeArray.map(async (_, index) => {
                    const strIndex = (index + 1).toString();
                    const imgUrl = await getImgUrl(typedTypeName, strIndex);

                    galleryItems.push({
                        id: `${typedTypeName}_${strIndex}`,
                        imgUrl: imgUrl.default,
                        type: typedTypeName,
                    });
                })
            );
        })
    );

    return galleryItems;
};

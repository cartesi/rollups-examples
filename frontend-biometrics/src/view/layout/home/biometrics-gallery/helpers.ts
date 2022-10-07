import { BiometricsType, GalleryItem } from "./biometrics-gallery.board";
import biometricsfake1 from "../../../../assets/img/biometrics/fake_1.png";
import biometricsfake2 from "../../../../assets/img/biometrics/fake_2.png";
import biometricsfake3 from "../../../../assets/img/biometrics/fake_3.png";
import biometricsfake4 from "../../../../assets/img/biometrics/fake_4.png";
import biometricsfake5 from "../../../../assets/img/biometrics/fake_5.png";
import biometricslive1 from "../../../../assets/img/biometrics/live_1.png";
import biometricslive2 from "../../../../assets/img/biometrics/live_2.png";
import biometricslive3 from "../../../../assets/img/biometrics/live_3.png";
import biometricslive4 from "../../../../assets/img/biometrics/live_4.png";
import biometricslive5 from "../../../../assets/img/biometrics/live_5.png";

const img = {
    biometricsfake1,
    biometricsfake2,
    biometricsfake3,
    biometricsfake4,
    biometricsfake5,
    biometricslive1,
    biometricslive2,
    biometricslive3,
    biometricslive4,
    biometricslive5,
};

export const getGalleryItems = (): GalleryItem[] => {
    const galleryItems: GalleryItem[] = [];
    const biometricsTypes = Object.keys(BiometricsType);
    const fakeArray = Array.from({ length: 5 });

    biometricsTypes.forEach((typeName) => {
        const typedTypeName = typeName as keyof typeof BiometricsType;
        fakeArray.forEach((_, index) => {
            const strIndex = (index + 1).toString();
            const imgKey = `biometrics${typedTypeName}${strIndex}` as keyof typeof img;
            const imgUrl = img[imgKey];

            galleryItems.push({
                id: `${typedTypeName}_${strIndex}`,
                imgUrl: imgUrl,
                type: typedTypeName,
            });
        })
    })

    return galleryItems;
};

import { FC } from "react";
import { motion } from "framer-motion";
import ShipSVG from "../../../../assets/img/ship.svg";
import IcebergSVG from "../../../../assets/img/iceberg.svg";
import { OceanWrapper, ShipCrashAnimationBoard, ShipCrashAnimationWrapper } from "./ship-crash.style";
import { Image } from "../../../atomic/image.mol/image.mol";

export const ShipCrashAnimation: FC = () => {
    return (
        <ShipCrashAnimationWrapper>
            <ShipCrashAnimationBoard xs={12}>
                <motion.div
                    initial={{
                        x: -10,
                        y: -12,
                    }}
                    animate={{
                        x: 50,
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                    }}
                >
                    <Image src={ShipSVG} size="xs" />
                </motion.div>
                <motion.div
                    initial={{
                        x: 20,
                        y: 22,
                    }}
                >
                    <Image src={IcebergSVG} />
                </motion.div>
            </ShipCrashAnimationBoard>
            <OceanWrapper />
        </ShipCrashAnimationWrapper>
    );
}

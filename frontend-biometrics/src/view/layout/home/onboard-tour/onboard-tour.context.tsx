// Copyright 2022 Cartesi Pte. Ltd.

// Licensed under the Apache License, Version 2.0 (the "License"); you may not use
// this file except in compliance with the License. You may obtain a copy of the
// License at http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software distributed
// under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
// CONDITIONS OF ANY KIND, either express or implied. See the License for the
// specific language governing permissions and limitations under the License.

import { FC, PropsWithChildren, useContext } from "react";
import { ShepherdTour, ShepherdTourContext, Tour } from "react-shepherd";
import { onBoardTourSteps } from "./onboard-tour.steps";

const tourOptions: Tour.TourOptions = {
    defaultStepOptions: {
        cancelIcon: {
            enabled: true,
        },
    },
    useModalOverlay: true,
};

export const OnboardTourProvider: FC<PropsWithChildren> = ({ children }) => {
    return (
        <ShepherdTour steps={onBoardTourSteps} tourOptions={tourOptions}>
            {children}
        </ShepherdTour>
    );
};

export const useOnboardTour = () => {
    const tour = useContext(ShepherdTourContext);

    if (!tour)
        throw new Error(
            "useOnboardTour must be used inside an OnboardTourProvider tree."
        );

    return tour;
};

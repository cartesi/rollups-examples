// Copyright 2022 Cartesi Pte. Ltd.

// Licensed under the Apache License, Version 2.0 (the "License"); you may not use
// this file except in compliance with the License. You may obtain a copy of the
// License at http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software distributed
// under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
// CONDITIONS OF ANY KIND, either express or implied. See the License for the
// specific language governing permissions and limitations under the License.

import { ShepherdButtonWithType } from "react-shepherd";
import { onboardTourCSSClass } from "./onboard-tour.style";

enum StepType {
    FirstStep = "FirstStep",
    LastStep = "LastStep",
    CommonStep = "CommonStep",
}

const buttons: ShepherdButtonWithType[] = [
    {
        classes: onboardTourCSSClass["onboard-tour-button-secondary"],
        text: "Exit",
        type: "cancel",
    },
    {
        classes: onboardTourCSSClass["onboard-tour-button-primary"],
        text: "Back",
        type: "back",
    },
    {
        classes: onboardTourCSSClass["onboard-tour-button-primary"],
        text: "Next",
        type: "next",
    },
];

export const resetTourScroll = () =>
    new Promise(function (resolve) {
        setTimeout(function () {
            window.scrollTo(0, 0);
            resolve(void 0);
        }, 500);
    });

export const getStepButtons = (
    stepType?: keyof typeof StepType
): ShepherdButtonWithType[] =>
    buttons.map((button) => {
        if (stepType === "FirstStep" && button.type === "back")
            return {
                ...button,
                disabled: true,
            };
        else if (stepType === "LastStep" && button.type === "next")
            return {
                ...button,
                disabled: true,
            };
        return button;
    });

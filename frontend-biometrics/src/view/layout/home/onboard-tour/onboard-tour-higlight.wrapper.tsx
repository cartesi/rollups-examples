// Copyright 2022 Cartesi Pte. Ltd.

// Licensed under the Apache License, Version 2.0 (the "License"); you may not use
// this file except in compliance with the License. You may obtain a copy of the
// License at http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software distributed
// under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
// CONDITIONS OF ANY KIND, either express or implied. See the License for the
// specific language governing permissions and limitations under the License.

import { FC, PropsWithChildren } from "react";
import { Row, Col } from "react-grid-system";
import { onboardTourCSSClass } from "./onboard-tour.style";

interface IOnboardHighlightWrapper {
    className: keyof typeof onboardTourCSSClass;
}

export const OnboardTourHighlightWrapper: FC<
    PropsWithChildren<IOnboardHighlightWrapper>
> = ({ children, className }) => {
    return (
        <Row className={className}>
            <Col>{children}</Col>
        </Row>
    );
};

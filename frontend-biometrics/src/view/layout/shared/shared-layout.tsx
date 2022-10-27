// Copyright 2022 Cartesi Pte. Ltd.

// Licensed under the Apache License, Version 2.0 (the "License"); you may not use
// this file except in compliance with the License. You may obtain a copy of the
// License at http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software distributed
// under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
// CONDITIONS OF ANY KIND, either express or implied. See the License for the
// specific language governing permissions and limitations under the License.

import { FC, PropsWithChildren, useState } from "react";
import { Container } from "react-grid-system";
import { Button } from "../../atomic/button.mol/button.mol";
import { Footer, Header, Main } from "../../atomic/layout.org/layout.mol";
import { H2 } from "../../atomic/typography.mol";
import { useOnboardTour } from "../home/onboard-tour/onboard-tour.context";
import { onboardTourCSSClass } from "../home/onboard-tour/onboard-tour.style";
import { string } from "./constants";
import { WalletManagerModal } from "./wallet-manager.modal";

export const SharedLayout: FC<PropsWithChildren> = ({ children }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const onboardTour = useOnboardTour();

    return (
        <>
            <Header>
                <H2 color="lightMain" paddingX="md" isBold>
                    {string.header}
                </H2>
                <Button
                    className={onboardTourCSSClass['onboard-tour-element-1']}
                    variant="link"
                    onClick={() => {
                        setIsModalOpen(true);
                    }}
                >
                    {string.manageWalletButton.text}
                </Button>
                <WalletManagerModal
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                    }}
                />
            </Header>
            <Main>
                <Container fluid>{children}</Container>
            </Main>
            <Footer>
                <Button variant="link" onClick={onboardTour.start}>
                    {string.onboardTourButton.text}
                </Button>
            </Footer>
        </>
    );
};

import { setConfiguration } from "react-grid-system";
import { initWeb3Wallet } from "./config/web3-wallet.setup";
import { GlobalStyle } from "./view/atomic/global-style.mol";
import { HomeView } from "./view/layout/home/home-view";

// Grid system setup
setConfiguration({ maxScreenClass: "xl" });
// web3 wallet setup
initWeb3Wallet();

export const App = () => (
    <>
        <GlobalStyle />
        <HomeView />
    </>
)

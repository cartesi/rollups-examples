import { GlobalStyle } from "./view/atomic/global-style.mol";
import { HomeView } from "./view/layout/home/home-view";
import { setConfiguration } from "react-grid-system";

setConfiguration({ maxScreenClass: 'xl' })

export const App = () => {
    return (
        <>
            <GlobalStyle />
            <HomeView />
        </>
    );
};

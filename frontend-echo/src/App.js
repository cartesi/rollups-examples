import "./App.css";
import RoarForm from "./RoarForm";
import Echoes from "./Echoes";
import React, { useState } from "react";
import { Flex, Spacer } from "@chakra-ui/react";

// Simple App to present the Input field and produced Notices
function App() {
    const [accountIndex] = useState(0);

    return (
        <div className="App">
            <header className="App-header">
                <h1>Echo DApp</h1>
                <Flex>
                    <RoarForm accountIndex={accountIndex} />
                    <Spacer />
                    <Echoes />
                </Flex>
            </header>
        </div>
    );
}

export default App;

export const brandName = "Titanic Survivor"

export const metadata = {
    app: {
        title: brandName,
    },
};

export const id = {
    sendInputForm: {
        main: "sendInputForm",
        ageInput: "Age",
        sexInput: "Sex",
        embarkedInput: "Embarked",
    },
};

export const string = {
    resultPreview: {
        title: "Result preview",
        idleFeedback: "Use the form to get started! 🧊🚢",
        pendingFeedback: "Waiting for result...",
        survivedFeeback: "YOU SURVIVED!",
        sankFeedback: "YOU SANK!",
    },
    sendInputForm: {
        ageInputText: "Age",
        sexInputText: "Gender",
        embarkedInputText: "Embarked from",
        submitButtonText: "See result",
        clearButtonText: "Clear result",
        loadingButtonText: "Waiting...",
        description:
            "Try if you would survive or sink in the Titanic crash! 👀",
    },
    sendInputFeedback: {
        requestStarted:
            "Sending infos, wait please. It may take a few minutes.",
        onError: "Sorry! An error occurred while send infos, try again later.",
    },
    fetchNoticesFeedback: {
        onSucess: "Your result is ready!",
        onError: "Sorry! An error occurred while get result, try again later.",
    },
};

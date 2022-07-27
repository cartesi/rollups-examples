const brandColor = {
    main: "#1E1941",
    lightMain: "#5E4E92",
    mediumMain: "#332C63",
};

export const color = {
    ...brandColor,
    white: "#FFFFFF",
    gray: "#9E9E9E",
    mediumGray: "#7A7A7A",
};

export const typography = {
    fontFamily: "'Rubik', sans-serif",
    fontSize: "16px",
    weight: {
        light: "300",
        regular: "400",
        bold: "500"
    }
};

export const spacing = {
    padding: {
        layout: "2.1875rem",
        sm: "0.6rem",
        md: "1rem",
        lg: "2.0rem",
        xlg: "4.0rem"
    },
    margin: {
        general: {
            lg: "1.8rem",
        },
        separator: {
            horizontal: {
                lg: "1.5rem 0rem",
                md: "0.75rem 0rem",
                xlg: "2.8rem 0rem"
            },
            vertical: {
                md: "0rem 0.125rem",
            },
        },
    },
};

export const size = {
    button: {
        height: "40px",
        width: "121px",
    },
    card: {
        height: "164px",
        width: "445px",
    },
    general: {
        fluid: "100%",
    },
    header: {
        height: "84px",
    },
    icon: {
        sm: "1rem",
        md: "1.8rem",
        lg: "2.5rem",
    },
    iconButton: {
        md: "40px",
    },
    image: {
        brand: {
            lg: "21.5rem",
        },
    },
    separator: {
        vertical: {
            lg: {
                height: "2.0rem",
            },
            md: {
                height: "1rem",
                width: "1px",
            },
        },
    },
    scroll: "6px",
};

export const border = {
    general: "2px solid",
    separator: "1px solid"
};

export const radius = {
    md: "4px"
}

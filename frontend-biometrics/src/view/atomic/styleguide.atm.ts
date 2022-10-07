// Copyright 2022 Cartesi Pte. Ltd.

// Licensed under the Apache License, Version 2.0 (the "License"); you may not use
// this file except in compliance with the License. You may obtain a copy of the
// License at http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software distributed
// under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
// CONDITIONS OF ANY KIND, either express or implied. See the License for the
// specific language governing permissions and limitations under the License.

const brandColor = {
    main: "#1E1941",
    lightMain: "#5E4E92",
    mediumMain: "#332C63",
    sweetMain: "#C4A8FF",
};

export const color = {
    ...brandColor,
    white: "#FFFFFF",
    dark: "#000",
    gray: "#9E9E9E",
    mediumGray: "#7A7A7A",
};

export const typography = {
    fontFamily: "'Rubik', sans-serif",
    fontSize: "16px",
    weight: {
        light: "300",
        regular: "400",
        bold: "500",
    },
};

export const spacing = {
    padding: {
        layout: "2.1875rem",
        sm: "0.6rem",
        md: "1rem",
        lg: "2.0rem",
        xlg: "4.0rem",
    },
    margin: {
        general: {
            lg: "1.8rem",
        },
        separator: {
            horizontal: {
                lg: "1.5rem 0rem",
                md: "0.75rem 0rem",
                xlg: "2.8rem 0rem",
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
        height: "26rem",
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
        lg: "18.5rem",
        md: "10rem",
        sm: "6rem",
        xs: "3rem",
    },
    input: {
        select: {
            wrapper: {
                height: "2.636rem",
            },
        },
    },
    modal: {
        minHeight: "296px",
        minWidth: "296px",
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
    separator: "1px solid",
    small: "1px solid",
    large: "4px solid",
};

export const radius = {
    md: "4px",
    lg: "8px",
};

export const zIndex = {
    ground: -1,
    high: 3,
    low: 2,
    roof: 6,
    veryHigh: 5,
    veryLow: 1,
};

export const linearGradient = {
    ocean: `linear-gradient(
        165.59deg,
        #abdbff95 -64.65%,
        #a8ffff -2.09%,
        #afa8ff00 74.49%
    )`,
};

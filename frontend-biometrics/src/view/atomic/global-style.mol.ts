// Copyright 2022 Cartesi Pte. Ltd.

// Licensed under the Apache License, Version 2.0 (the "License"); you may not use
// this file except in compliance with the License. You may obtain a copy of the
// License at http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software distributed
// under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
// CONDITIONS OF ANY KIND, either express or implied. See the License for the
// specific language governing permissions and limitations under the License.

import { createGlobalStyle } from "styled-components";
import { buttonVariantCss } from "./button.mol/button.atm";
import { border, color, radius, spacing, typography, zIndex } from "./styleguide.atm";

export const GlobalStyle = createGlobalStyle`
    /***
        The new CSS reset - version 1.7.2 (last updated 23.6.2022)
        GitHub page: https://github.com/elad2412/the-new-css-reset
    ***/
    /*
        Remove all the styles of the "User-Agent-Stylesheet", except for the 'display' property
        - The "symbol *" part is to solve Firefox SVG sprite bug
    */
    *:where(:not(html, iframe, canvas, img, svg, video):not(svg *, symbol *)) {
        all: unset;
        display: revert;
    }
    /* Preferred box-sizing value */
    *,
    *::before,
    *::after {
        box-sizing: border-box;
    }
    /* Reapply the pointer cursor for anchor tags */
    a, button {
        cursor: revert;
    }
    /* Remove list styles (bullets/numbers) */
    ol, ul, menu {
        list-style: none;
    }
    /* For images to not be able to exceed their container */
    img {
        max-width: 100%;
    }
    /* removes spacing between cells in tables */
    table {
        border-collapse: collapse;
    }
    /* Safari - solving issue when using user-select:none on the <body> text input doesn't working */
    input, textarea {
        user-select: auto;
    }
    /* revert the 'white-space' property for textarea elements on Safari */
    textarea {
        white-space: revert;
    }
    /* minimum style to allow to style meter element */
    meter {
        -webkit-appearance: revert;
        appearance: revert;
    }
    /* reset default text opacity of input placeholder */
    ::placeholder {
        color: unset;
    }
    /* fix the feature of 'hidden' attribute.
    display:revert; revert to element instead of attribute */
    :where([hidden]) {
        display: none;
    }
    /* revert for bug in Chromium browsers
    - fix for the content editable attribute will work properly.
    - webkit-user-select: auto; added for Safari in case of using user-select:none on wrapper element*/
    :where([contenteditable]:not([contenteditable="false"])) {
        -moz-user-modify: read-write;
        -webkit-user-modify: read-write;
        overflow-wrap: break-word;
        line-break: after-white-space;
        user-select: auto;
    }
    /* apply back the draggable feature - exist only in Chromium and Safari */
    :where([draggable="true"]) {
        -webkit-user-drag: element;
    }
    /*
        propietary
    */
    html {
        font-family: ${typography.fontFamily};
        font-size: ${typography.fontSize};
        :root {
            //Wallet modal z-index
            --account-center-z-index: ${zIndex.veryHigh};
        }
    }
    body {
        //General styles
        background-color: ${color.main};
        //Toast styles
        .toastContainer {
            z-index: ${zIndex.roof};
        }
        //Shepherd tour styles
        .shepherd-modal-overlay-container {
            z-index: ${zIndex.veryHigh};
            filter: alpha(opacity=50);
            height: 100%;
            left: 0;
            opacity: 0.5;
            position: fixed;
            top: 0;
            -webkit-transition: all 0.3s ease-out;
            transition: all 0.3s ease-out;
            width: 100%;
        }
        .shepherd-element.shepherd-enabled {
            z-index: ${zIndex.roof};
            position: relative;
            font-family: ${typography.fontFamily};
            color: ${color.dark};
            background-color: ${color.white};
            border: ${border.general} ${color.sweetMain};
            border-radius: ${radius.md};
            padding: ${spacing.padding.md};
            header {
                display: flex;
                justify-content: space-between;
                font-weight: ${typography.weight.bold};
                button {
                    color: ${color.lightMain};
                    cursor: pointer;
                    &:hover:enabled {
                        color: ${color.sweetMain};
                    }
                }
            }
            .shepherd-text {
                padding: ${spacing.padding.md} 0;
            }
            footer {
                button.onboard-tour-button-primary {
                    ${buttonVariantCss.secondary}
                }
                button.onboard-tour-button-secondary {
                    ${buttonVariantCss.link}
                    &:hover:enabled {
                        color: ${color.sweetMain};
                    }
                }
                button {
                    padding: ${spacing.padding.sm} !important;
                    margin-right: ${spacing.margin.general.sm};
                    &:disabled {
                        cursor: not-allowed;
                        opacity: 0.4;
                    }
                }
            }
        }
    }
`;

// Light theme

"use strict";

import ThemeConstants from "./theme-consts";
import { ColorTheme } from "./theme-interfaces";

const DEFAULT_LIGHT_THEME_ID = "light";

const LightTheme: ColorTheme = {
    id: DEFAULT_LIGHT_THEME_ID,
    background: ThemeConstants.colors.lightBackground,
    text: ThemeConstants.colors.black,
    border: "rgba(0, 0, 0, 0.1)",
    stepButtonCurrentBackground: ThemeConstants.colors.blueLight,
    stepButtonBackground: "#181818",
    modalBackground: "rgba(255, 255, 255, 0.9)",
    inputBackground: "white",
    inputBorderColor: "black",
    links: ThemeConstants.colors.blueLight,
    success: "green",
    error: "red",
    warning: "orange",
    homeFooterBackground: "#ffffff",
    currentTextColor: ThemeConstants.colors.blueLight,
    areaBackground: "#ffffff",
    homeHeaderButtonBackground: "#ffffff",
    inputPlaceholderColor: "rgba(0, 0, 0, 0.6)",
    activityIndicatorColor: ThemeConstants.colors.blueLight,
    chartLineColor: ThemeConstants.colors.blueLight,
    chartLineAreaFillColor: ThemeConstants.colors.blueLight,
    transactionItemBackground: "#d5e6fb",
    transactionItemIconBackgroundColor: ThemeConstants.colors.blueLight,
    transactionItemIconColor: "white",
    deviceItemBackground: ThemeConstants.colors.lightBackground,
    notificationsUnreadMarkColor: "red",
    guideMessageBackground: "#ffffff",
    guideOverlayBackground: "rgba(0, 0, 0, 0.5)",
    overlayBackground: "rgba(0, 0, 0, 0.5)",
    navigationBarBackground: "#f6f6f6",
    navigationBarButtonStyle: "dark",
};

export default LightTheme;

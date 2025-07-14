// Dark theme

"use strict";

import ThemeConstants from "./theme-consts";
import { ColorTheme } from "./theme-interfaces";

const DEFAULT_DARK_THEME_ID = "dark";

const DarkTheme: ColorTheme = {
    id: DEFAULT_DARK_THEME_ID,
    background: ThemeConstants.colors.darkBackground,
    text: ThemeConstants.colors.white,
    border: "rgba(255, 255, 255, 0.1)",
    stepButtonCurrentBackground: ThemeConstants.colors.blueLight,
    stepButtonBackground: "#ffffff",
    modalBackground: "rgba(0, 0, 0, 0.9)",
    inputBackground: "#1c1c25",
    inputBorderColor: "#44444c",
    links: ThemeConstants.colors.blueLight,
    success: "green",
    error: "red",
    warning: "orange",
    homeFooterBackground: "#000",
    currentTextColor: ThemeConstants.colors.blueLight,
    areaBackground: "#1c1c25",
    homeHeaderButtonBackground: "#1e1e1e",
    inputPlaceholderColor: "rgba(255, 255, 255, 0.6)",
    activityIndicatorColor: ThemeConstants.colors.blueLight,
    chartLineColor: ThemeConstants.colors.blueLight,
    chartLineAreaFillColor: ThemeConstants.colors.blueLight,
    transactionItemBackground: "#23232d",
    transactionItemIconBackgroundColor: "white",
    transactionItemIconColor: "black",
    deviceItemBackground: "#23232d",
    notificationsUnreadMarkColor: "red",
    guideMessageBackground: "#1c1c25",
    guideOverlayBackground: "rgba(0, 0, 0, 0.5)",
    overlayBackground: "rgba(0, 0, 0, 0.5)",
    navigationBarBackground: "#000000",
    navigationBarButtonStyle: "light",
};

export default DarkTheme;

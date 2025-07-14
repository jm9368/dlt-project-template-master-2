import { ScaledSize, StyleSheet } from "react-native";
import { ColorTheme } from "../theme-interfaces";

const AppWrapperStyles = (theme: ColorTheme, windowDimensions: ScaledSize, actualHeight: number) => {
    return StyleSheet.create({
        container: {
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: actualHeight,
            backgroundColor: theme.background,
        },
    });
};

export default AppWrapperStyles;

import { ScaledSize, StyleSheet } from "react-native";
import Constants from "expo-constants";
import { ColorTheme } from "../theme-interfaces";

const AuthBaseStyles = (theme: ColorTheme, windowDimensions: ScaledSize, actualHeight: number) => {
    return StyleSheet.create({
        container: {
            backgroundColor: theme.background,
            paddingVertical: 0,
            height: actualHeight,
            width: "100%",
            paddingTop: Constants.statusBarHeight,
        },
        scrollContainer: {
            flex: 1,
        },
        scrollContent: {},
        background: {
            position: "absolute",
            top: 0,
            right: 0,
            left: 0,
            padding: 0,
            width: "100%",
        },
        iconContainer: {
            paddingTop: 90,
            paddingLeft: 40,
            paddingRight: 40,
        },
        childrenContainer: {
            paddingTop: 60,
            paddingLeft: 40,
            paddingRight: 40,
        },
        icon: {
            width: 80,
            height: 50,
        },
    });
};

export default AuthBaseStyles;

import { StyleSheet } from "react-native";
import Constants from "expo-constants";
import { ColorTheme } from "../theme-interfaces";

const AppLoaderStyles = (theme: ColorTheme) => {
    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.background,
            padding: 0,
            width: "100%",
            marginTop: Constants.statusBarHeight,

            alignItems: "center",
            justifyContent: "center",
        },
        background: {
            width: "100%",
        },
    });
};

export default AppLoaderStyles;

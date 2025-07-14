import { StyleSheet } from "react-native";
import ThemeConstants from "../theme-consts";
import Constants from "expo-constants";
import { ColorTheme } from "../theme-interfaces";

const WebViewModalStyles = (theme: ColorTheme) => {
    return StyleSheet.create({
        container: {
            backgroundColor: "transparent",
            marginTop: Constants.statusBarHeight,
            flex: 1,
            padding: 10,
        },
        containerInner: {
            backgroundColor: theme.areaBackground,
            flex: 1,
        },
        header: {
            paddingHorizontal: 20,
        },
        headerInner: {
            borderBottomColor: theme.text,
            borderBottomWidth: 2,
            flexDirection: "row",
            alignItems: "center",
        },
        webViewContainer: {
            flex: 1,
            paddingVertical: 8,
            paddingHorizontal: 5,
        },
        titleContainer: {
            flex: 1,
            paddingVertical: 20,
        },
        title: {
            fontFamily: ThemeConstants.fonts.main,
            color: theme.text,
            fontSize: 22,
            fontWeight: "bold",
            marginBottom: 5,
        },
        role: {
            fontFamily: ThemeConstants.fonts.main,
            color: theme.text,
            fontSize: 16,
            marginBottom: 3,
        },
        closeButtonContainer: {
            paddingVertical: 20,
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "flex-start",
            height: "100%",
        },
        closeButton: {},
    });
};

export default WebViewModalStyles;

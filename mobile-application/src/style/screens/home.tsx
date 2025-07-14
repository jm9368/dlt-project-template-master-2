import { StyleSheet } from "react-native";
import Constants from "expo-constants";
import ThemeConstants from "../theme-consts";
import { ColorTheme } from "../theme-interfaces";

const HomeScreenStyles = (theme: ColorTheme) => {
    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.background,
            padding: 0,
            width: "100%",
            paddingTop: Constants.statusBarHeight,
        },
        text: {
            fontFamily: ThemeConstants.fonts.main,
            color: theme.text,
        },
        row: {
            flexDirection: "row",
            paddingBottom: 10,
        },
        titleContainer: {
            flexDirection: "row",
            alignItems: "center",
            paddingBottom: 15,
        },
        title: {
            color: theme.text,
            fontFamily: ThemeConstants.fonts.main,
            fontWeight: "bold",
            fontSize: 22,
            flex: 1,
        },
        titleMenuButton: {
            marginLeft: 8,
            borderWidth: 1,
            borderColor: theme.links,
            borderRadius: 8,
            padding: 8,
            flexDirection: "row",
            alignItems: "center",
        },
        titleMenuButtonText: {
            marginLeft: 8,
            color: theme.text,
            fontFamily: ThemeConstants.fonts.main,
            fontSize: 11,
        },
    });
};

export default HomeScreenStyles;

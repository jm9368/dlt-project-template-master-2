import { StyleSheet } from "react-native";
import ThemeConstants from "../theme-consts";
import { ColorTheme } from "../theme-interfaces";

const AuthStyles = (theme: ColorTheme) => {
    return StyleSheet.create({
        title: {
            fontFamily: ThemeConstants.fonts.main,
            fontSize: 24,
            fontWeight: "bold",
            marginBottom: 18,
            color: theme.text,
        },
        buttonContainer: {
            flexDirection: "row",
            justifyContent: "center",
        },
        descriptionTextContainer: {
            paddingBottom: 20,
        },
        descriptionText: {
            fontFamily: ThemeConstants.fonts.main,
            color: theme.text,
        },
        preferencesContainerItem: {
            paddingBottom: 30,
        },
        preferencesContainer: {
            paddingTop: 20,
            paddingBottom: 20,
        },
        bottomTextRow: {
            paddingVertical: 20,
            flexDirection: "row",
            flexWrap: "wrap",
            alignItems: "center",
        },
        bottomText: {
            fontFamily: ThemeConstants.fonts.main,
            color: theme.text,
        },
        thirdPartyLinkContainer: {
            paddingBottom: 20,
            flexDirection: "row",
            flexWrap: "wrap",
            alignItems: "center",
        },
    });
};

export default AuthStyles;

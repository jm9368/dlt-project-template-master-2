import { StyleSheet } from "react-native";
import Constants from "expo-constants";
import ThemeConstants from "../theme-consts";
import { ColorTheme } from "../theme-interfaces";

const ProfileScreenStyles = (theme: ColorTheme) => {
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
            alignItems: "center",
        },

        profileImageContainer: {
            flexDirection: "row",
            paddingBottom: 10,
            alignItems: "center",
            justifyContent: "center",
        },

        profileImage: {
            width: 96,
            height: 96,
            borderRadius: 48,
            backgroundColor: "lightgrey",
        },

        profileName: {
            color: theme.text,
            fontFamily: ThemeConstants.fonts.main,
            fontSize: 22,
            marginBottom: 12,
            textAlign: "center",
        },

        username: {
            color: theme.text,
            fontFamily: ThemeConstants.fonts.main,
            fontSize: 14,
            marginBottom: 20,
            textAlign: "center",
            opacity: 0.8,
        },

        notFoundDescription: {
            color: theme.text,
            fontFamily: ThemeConstants.fonts.main,
            fontSize: 14,
            marginBottom: 20,
        },

        detail: {
            color: theme.text,
            fontFamily: ThemeConstants.fonts.main,
            fontSize: 14,
            marginLeft: 8,
        },

        rowButtons: {
            flexDirection: "row",
            paddingTop: 10,
            alignItems: "center",
        },
    });
};

export default ProfileScreenStyles;

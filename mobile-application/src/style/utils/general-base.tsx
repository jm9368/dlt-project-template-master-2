import { ScaledSize, StyleSheet } from "react-native";
import Constants from "expo-constants";
import ThemeConstants from "../theme-consts";
import { ColorTheme } from "../theme-interfaces";

const GeneralScreenBaseStyles = (theme: ColorTheme, windowDimensions: ScaledSize, actualHeight: number) => {
    return StyleSheet.create({
        container: {
            backgroundColor: theme.background,
            paddingVertical: 0,
            height: actualHeight,
            width: "100%",
            paddingTop: Constants.statusBarHeight,
            paddingBottom: 0,
        },
        scrollContainer: {
            flex: 1,
        },
        scrollContent: {
            height: actualHeight - Constants.statusBarHeight,
        },
        header: {
            flexDirection: "row",
            alignItems: "center",
            width: "100%",
            padding: 18,
        },
        headerImageContainer: {
            marginRight: 10,
        },
        headerImage: {
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: "lightgrey",
        },
        headerTextContainer: {
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
        },
        headerText: {
            fontFamily: ThemeConstants.fonts.main,
            color: theme.text,
            fontSize: 16,
        },
        headerTextUsername: {
            fontFamily: ThemeConstants.fonts.main,
            color: theme.text,
            fontWeight: "bold",
            fontSize: 16,
        },
        headerButtonContainer: {
            width: 48,
            marginLeft: 10,
        },
        headerButton: {
            backgroundColor: theme.homeHeaderButtonBackground,
            width: 48,
            height: 48,
            borderRadius: 12,
            justifyContent: "center",
            alignItems: "center",
        },
        body: {
            flex: 1,
            paddingHorizontal: 18,
            paddingVertical: 9,
        },
        footer: {
            backgroundColor: theme.homeFooterBackground,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-evenly",
            width: "100%",
            height: 70,
        },
        footerButton: {
            height: "100%",
            justifyContent: "center",
            alignItems: "center",
            width: "20%",
        },
        notificationsUnreadMark: {
            backgroundColor: theme.notificationsUnreadMarkColor,
            width: 12,
            height: 12,
            borderRadius: 6,
            position: "absolute",
            top: 10,
            right: 10,
        },

        guideOverlay: {
            position: "absolute",
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            backgroundColor: theme.guideOverlayBackground,
        },

        busyContainer: {
            position: "absolute",
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            backgroundColor: theme.guideOverlayBackground,
            justifyContent: "center",
            alignItems: "center",
        },

        busyMessage: {
            fontFamily: ThemeConstants.fonts.main,
            color: theme.text,
            fontSize: 16,
            backgroundColor: theme.areaBackground,
            padding: 10,
            marginTop: 10,
            borderRadius: 8,
            textAlign: "center",
        },
    });
};

export default GeneralScreenBaseStyles;

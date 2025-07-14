import { StyleSheet } from "react-native";
import Constants from "expo-constants";
import ThemeConstants from "../theme-consts";
import { ColorTheme } from "../theme-interfaces";

const WalletSettingsScreensStyles = (theme: ColorTheme) => {
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

        subTitleContainer: {
            flexDirection: "row",
            paddingBottom: 10,
        },

        subTitle: {
            color: theme.text,
            fontFamily: ThemeConstants.fonts.main,
            fontWeight: "bold",
            fontSize: 18,
        },

        walletContainer: {
            paddingBottom: 12,
        },

        walletContainerInner: {
            borderRadius: 16,
            backgroundColor: theme.areaBackground,
            padding: 16,
        },

        walletHeader: {
            flexDirection: "row",
            alignItems: "center",
        },

        walletIconContainer: {
            width: 48,
            height: 48,
            borderRadius: 24,
            borderColor: theme.border,
            borderWidth: 1,
            justifyContent: "center",
            alignItems: "center",
        },

        walletName: {
            fontFamily: ThemeConstants.fonts.main,
            color: theme.text,
            fontSize: 18,
            fontWeight: "bold",
            flex: 1,
            minWidth: 0,
            marginLeft: 8,
        },

        walletAddress: {
            paddingVertical: 8,
            opacity: 0.8,
            fontFamily: ThemeConstants.fonts.main,
            color: theme.text,
        },

        walletOptionsRow: {
            paddingBottom: 10,
            flexDirection: "row",
            justifyContent: "space-between",
        },
    });
};

export default WalletSettingsScreensStyles;

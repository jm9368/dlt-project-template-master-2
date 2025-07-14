import { StyleSheet } from "react-native";
import ThemeConstants from "../theme-consts";
import { ColorTheme } from "../theme-interfaces";

const GuideBoxStyles = (theme: ColorTheme) => {
    return StyleSheet.create({
        container: {
            position: "absolute",
            backgroundColor: theme.guideMessageBackground,
            borderRadius: 8,
            left: 8,
            right: 8,
            paddingVertical: 10,
            paddingHorizontal: 20,
        },

        /* Triangles */

        triangleTop: {
            width: 16,
            height: 16,
            position: "absolute",
            top: -16,
            borderLeftWidth: 16,
            borderLeftColor: "transparent",
            borderRightWidth: 16,
            borderRightColor: "transparent",
            transform: [{ scaleY: 2 }],
        },

        triangleTopBorderHidden: {
            width: 16,
            height: 16,
            position: "absolute",
            top: -16,
            borderLeftWidth: 15,
            borderLeftColor: "transparent",
            borderRightWidth: 15,
            borderRightColor: "transparent",
            borderBottomWidth: 15,
            borderBottomColor: theme.guideMessageBackground,
            transform: [{ scaleY: 2 }],
        },

        triangleBottom: {
            width: 16,
            height: 16,
            position: "absolute",
            bottom: -15,
            borderLeftWidth: 16,
            borderLeftColor: "transparent",
            borderRightWidth: 16,
            borderRightColor: "transparent",
            transform: [{ scaleY: 2 }],
        },

        triangleBottomBorderHidden: {
            width: 16,
            height: 16,
            position: "absolute",
            bottom: -15,
            borderLeftWidth: 15,
            borderLeftColor: "transparent",
            borderRightWidth: 15,
            borderRightColor: "transparent",
            borderTopWidth: 15,
            borderTopColor: theme.guideMessageBackground,
            transform: [{ scaleY: 2 }],
        },

        /* Inner */

        closeButtonRow: {
            flexDirection: "row",
            justifyContent: "flex-end",
        },

        closeButton: {
            width: 20,
            height: 20,
            justifyContent: "center",
            alignItems: "center",
        },

        titleRow: {},

        title: {
            fontFamily: ThemeConstants.fonts.main,
            color: theme.links,
            fontSize: 18,
            fontWeight: "bold",
            paddingBottom: 15,
        },

        messageRow: {
            paddingBottom: 5,
        },

        message: {
            fontFamily: ThemeConstants.fonts.main,
            color: theme.text,
            fontSize: 14,
        },

        buttonsRow: {
            paddingTop: 15,
            paddingBottom: 10,
            flexDirection: "row",
            alignItems: "center",
        },

        omitButton: {},

        omitButtonText: {
            fontFamily: ThemeConstants.fonts.main,
            color: theme.text,
            fontSize: 16,
        },

        nextButton: {
            paddingLeft: 30,
        },

        nextButtonText: {
            fontFamily: ThemeConstants.fonts.main,
            color: theme.links,
            fontSize: 16,
        },
    });
};

export default GuideBoxStyles;

import { StyleSheet } from "react-native";
import ThemeConstants from "../theme-consts";
import { ColorTheme } from "../theme-interfaces";

const AppButtonStyles = (_theme: ColorTheme) => {
    return StyleSheet.create({
        // ...
        appButtonContainer: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            elevation: 8,
            backgroundColor: ThemeConstants.colors.blueLight,
            borderRadius: 10,
            paddingVertical: 13,
            paddingHorizontal: 80,
        },
        appButtonContainerFullSize: {
            width: "100%",
        },
        appButtonText: {
            fontSize: 18,
            color: "#fff",
            fontFamily: ThemeConstants.fonts.main,
            fontWeight: "bold",
            alignSelf: "center",
        },

        appButtonTextWithIcon: {
            marginLeft: 10,
        },

        disabled: {
            opacity: 0.65,
        },

        dangerContainer: {
            backgroundColor: "#dc3545",
        },
        dangerText: {
            color: "#fff",
        },

        successContainer: {
            backgroundColor: "#28a745",
        },
        successText: {
            color: "#fff",
        },

        infoContainer: {
            backgroundColor: "#17a2b8",
        },
        infoText: {
            color: "#fff",
        },

        warningContainer: {
            backgroundColor: "#ffc107",
        },
        warningText: {
            color: "#000",
        },

        secondaryContainer: {
            backgroundColor: "#6c757d",
        },
        secondaryText: {
            color: "#fff",
        },
    });
};

export default AppButtonStyles;

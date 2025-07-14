import { StyleSheet } from "react-native";
import ThemeConstants from "../theme-consts";
import { ColorTheme } from "../theme-interfaces";

const PreferenceButtonStyles = (theme: ColorTheme) => {
    return StyleSheet.create({
        container: {
            flexDirection: "row",
            alignItems: "center",
        },
        iconContainer: {
            width: 40,
        },
        name: {
            color: theme.text,
            fontSize: 16,
            fontFamily: ThemeConstants.fonts.main,
            overflow: "hidden",
        },
        nameHalf: {
            maxWidth: "50%",
        },
        nameNoValue: {
            flex: 1,
            minWidth: 1,
        },
        valueContainer: {
            flexDirection: "row",
            flex: 1,
            paddingLeft: 8,
        },
        value: {
            color: theme.text,
            fontSize: 16,
            fontFamily: ThemeConstants.fonts.main,
        },
    });
};

export default PreferenceButtonStyles;

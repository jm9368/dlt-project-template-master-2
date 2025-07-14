import { StyleSheet } from "react-native";
import ThemeConstants from "../theme-consts";
import { ColorTheme } from "../theme-interfaces";

const TouchableLinkStyles = (theme: ColorTheme) => {
    return StyleSheet.create({
        container: {
            backgroundColor: "transparent",
        },
        text: {
            fontFamily: ThemeConstants.fonts.main,
            color: theme.links,
        },
        small: {
            fontSize: 11,
        },
        underline: {
            textDecorationLine: "underline",
        },
    });
};

export default TouchableLinkStyles;

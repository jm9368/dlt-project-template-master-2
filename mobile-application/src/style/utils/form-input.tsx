import { StyleSheet } from "react-native";
import ThemeConstants from "../theme-consts";
import { ColorTheme } from "../theme-interfaces";

const AppFormInputStyles = (theme: ColorTheme) => {
    return StyleSheet.create({
        container: {
            paddingBottom: 20,
        },
        labelContainer: {
            flexDirection: "row",
            alignItems: "center",
        },
        label: {
            flex: 1,
            color: theme.text,
            fontFamily: ThemeConstants.fonts.main,
        },
        inputContainer: {
            paddingHorizontal: 15,
            paddingVertical: 10,
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: theme.inputBackground,
            borderColor: theme.inputBorderColor,
            borderWidth: 1,
            borderRadius: 12,
            marginTop: 8,
        },
        input: {
            flex: 1,
            color: theme.text,
            fontFamily: ThemeConstants.fonts.main,
            fontSize: 16,
            marginHorizontal: 5,
        },
        inputArea: {
            textAlignVertical: "top",
            maxHeight: 100,
        },
        inputError: {
            borderColor: theme.error,
        },
        errorContainer: {},
        error: {
            color: theme.error,
            fontFamily: ThemeConstants.fonts.main,
            fontSize: 11,
        },
    });
};

export default AppFormInputStyles;

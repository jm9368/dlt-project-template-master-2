import { StyleSheet } from "react-native";
import ThemeConstants from "../theme-consts";
import Constants from "expo-constants";
import { ColorTheme } from "../theme-interfaces";

const ModalPreferenceSelectStyles = (theme: ColorTheme) => {
    return StyleSheet.create({
        container: {
            backgroundColor: theme.modalBackground,
            marginTop: Constants.statusBarHeight,
            flex: 1,
            padding: 10,
        },
        containerInner: {
            backgroundColor: theme.areaBackground,
            flex: 1,
        },
        header: {
            paddingHorizontal: 20,
        },
        headerInner: {
            borderBottomColor: theme.text,
            borderBottomWidth: 2,
            flexDirection: "row",
            alignItems: "center",
        },
        optionsContainer: {
            flex: 1,
            padding: 20,
        },
        titleContainer: {
            flex: 1,
            padding: 20,
        },
        title: {
            fontFamily: ThemeConstants.fonts.main,
            color: theme.text,
            fontSize: 18,
            fontWeight: "bold",
        },
        closeButtonContainer: {
            padding: 20,
        },
        closeButton: {},
        optionContainer: {
            paddingBottom: 10,
        },
        optionContainerTouchable: {
            flexDirection: "row",
            alignItems: "center",
            padding: 10,
        },
        optionIconContainer: {
            width: 40,
        },
        optionNameContainer: {},
        optionNameText: {
            fontFamily: ThemeConstants.fonts.main,
            color: theme.text,
            fontSize: 14,
        },

        optionDetailText: {
            fontFamily: ThemeConstants.fonts.main,
            color: theme.text,
            fontSize: 12,
            opacity: 0.8,
        },
    });
};

export default ModalPreferenceSelectStyles;

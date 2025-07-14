import { StyleSheet } from "react-native";
import ThemeConstants from "../theme-consts";
import Constants from "expo-constants";
import { ColorTheme } from "../theme-interfaces";

const ModalUserSettingsStyles = (theme: ColorTheme) => {
    return StyleSheet.create({
        container: {
            backgroundColor: "transparent",
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
            paddingVertical: 5,
        },
        optionsContainer: {
            flex: 1,
            padding: 20,
        },
        option: {},
        profileImageContainer: {
            paddingRight: 10,
        },
        profileImage: {
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: "lightgrey",
        },
        profileNameContainer: {
            flex: 1,
            minWidth: 0,
        },
        profileName: {
            color: theme.text,
            fontFamily: ThemeConstants.fonts.main,
            overflow: "hidden",
            fontWeight: "bold",
            fontSize: 18,
        },
        username: {
            paddingTop: 4,
            color: theme.text,
            fontFamily: ThemeConstants.fonts.main,
            opacity: 0.8,
            fontSize: 14,
        },
        closeButtonContainer: {
            paddingVertical: 20,
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "flex-start",
            height: "100%",
        },
        closeButton: {},
        optionContainer: {
            paddingBottom: 18,
        },
        optionContainerTouchable: {
            flexDirection: "row",
            alignItems: "center",
            padding: 10,
        },
        optionName: {
            flex: 1,
            fontFamily: ThemeConstants.fonts.main,
            color: theme.text,
            fontSize: 16.5,
            paddingLeft: 20,
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
        separator: {
            marginBottom: 18,
            borderBottomColor: theme.text,
            borderBottomWidth: 1,
        },
        optionContainerNoValue: {},
    });
};

export default ModalUserSettingsStyles;

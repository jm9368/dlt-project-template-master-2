import { StyleSheet } from "react-native";
import Constants from "expo-constants";
import ThemeConstants from "../theme-consts";
import { ColorTheme } from "../theme-interfaces";

const ModalMenuSidebarStyles = (theme: ColorTheme) => {
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
            minHeight: 0,
        },
        option: {},
        titleContainer: {
            flex: 1,
            paddingVertical: 20,
        },
        title: {
            fontFamily: ThemeConstants.fonts.main,
            color: theme.text,
            fontSize: 22,
            fontWeight: "bold",
            marginBottom: 5,
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
        sectionTitle: {
            fontFamily: ThemeConstants.fonts.main,
            color: theme.text,
            fontSize: 18,
            fontWeight: "bold",
            paddingBottom: 15,
        },
    });
};

export default ModalMenuSidebarStyles;

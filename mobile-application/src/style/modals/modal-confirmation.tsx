import { StyleSheet } from "react-native";
import ThemeConstants from "../theme-consts";
import Constants from "expo-constants";
import { ColorTheme } from "../theme-interfaces";

const ModalConfirmationStyles = (theme: ColorTheme) => {
    return StyleSheet.create({
        container: {
            backgroundColor: theme.modalBackground,
            marginTop: Constants.statusBarHeight,
            flex: 1,
            paddingHorizontal: 10,
            paddingTop: 50,
        },
        containerInner: {
            backgroundColor: theme.background,
            borderRadius: 12,
        },
        header: {
            paddingHorizontal: 5,
        },
        headerInner: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "flex-end",
        },
        closeButtonContainer: {
            padding: 20,
        },
        closeButton: {},
        bodyContainer: {},
        titleContainer: {
            paddingHorizontal: 5,
            paddingBottom: 10,
        },
        title: {
            textAlign: "center",
            fontFamily: ThemeConstants.fonts.main,
            color: theme.text,
            fontSize: 24,
            fontWeight: "bold",
        },
        messageContainer: {
            paddingHorizontal: 5,
            paddingBottom: 20,
        },
        message: {
            textAlign: "center",
            fontFamily: ThemeConstants.fonts.main,
            color: theme.text,
            fontSize: 16,
        },
        rowContainer: {
            padding: 8,
        },
        buttonsContainer: {
            flexDirection: "row",
            justifyContent: "space-between",
            padding: 8,
        },
        buttonContainer: {
            paddingHorizontal: 4,
            width: "50%",
        },
    });
};

export default ModalConfirmationStyles;

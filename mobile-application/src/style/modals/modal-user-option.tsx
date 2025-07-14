import { StyleSheet } from "react-native";
import ThemeConstants from "../theme-consts";
import { ColorTheme } from "../theme-interfaces";

const ModalUserOptionStyles = (theme: ColorTheme) => {
    return StyleSheet.create({
        container: {
            flex: 1,
            paddingHorizontal: 20,
            paddingBottom: 25,
        },
        qrCodeLabel: {
            marginBottom: 10,
        },
        label: {
            flex: 1,
            color: theme.text,
            fontFamily: ThemeConstants.fonts.main,
        },
        qrCode: {
            marginTop: 10,
            alignItems: "center",
        },
        row: {
            paddingBottom: 18,
        },
        text: {
            color: theme.text,
            fontFamily: ThemeConstants.fonts.main,
        },
    });
};

export default ModalUserOptionStyles;

// Component: ThemeSelectModal
// Displays a modal to select the preferred app theme of the user

import { View, Text, TouchableOpacity } from "react-native";
import { useThemedStyle } from "../../../style/themed-style";
import ModalPreferenceSelectStyles from "../../../style/modals/modal-preference-select";
import { useTranslation } from "../../../hooks/translation";
import { AppPreferences } from "../../../control/app-preferences";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { useTheme } from "../../../style/theme-context";
import DarkTheme from "../../../style/dark";
import LightTheme from "../../../style/light";
import ModalContainer from "./ModalContainer";
import { NavigationProp } from "@react-navigation/native";

export default function ThemeSelectModal({ navigation }: { navigation: NavigationProp<any> }) {
    const { t } = useTranslation();

    const { theme, setTheme } = useTheme();

    const AvailableThemes = [
        {
            id: LightTheme.id,
            name: t("Light theme"),
            theme: LightTheme,
        },
        {
            id: DarkTheme.id,
            name: t("Dark theme"),
            theme: DarkTheme,
        },
    ];

    const Styles = useThemedStyle(ModalPreferenceSelectStyles);

    const getButtons = themeId => {
        return AvailableThemes.map(themeData => {
            const checkIcon = themeData.id === themeId ? <FontAwesomeIcon icon="check" size={16} color={theme.text} /> : null;

            return (
                <View key={themeData.id} style={Styles.optionContainer}>
                    <TouchableOpacity
                        style={Styles.optionContainerTouchable}
                        onPress={() => {
                            setTheme(themeData.theme);
                            AppPreferences.SetTheme(themeData.id);
                            navigation.goBack();
                        }}>
                        <View style={Styles.optionIconContainer}>{checkIcon}</View>
                        <View style={Styles.optionNameContainer}>
                            <Text style={Styles.optionNameText}>{themeData.name}</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            );
        });
    };

    return (
        <ModalContainer
            title={t("Select the application theme")}
            onClose={() => {
                navigation.goBack();
            }}>
            {getButtons(theme.id)}
        </ModalContainer>
    );
}

// Component: LanguageSelectModal
// Displays a modal to select the preferred language of the user

import { View, Text, TouchableOpacity } from "react-native";
import { useThemedStyle } from "../../../style/themed-style";
import ModalPreferenceSelectStyles from "../../../style/modals/modal-preference-select";
import { useTranslation } from "../../../hooks/translation";
import { AppPreferences } from "../../../control/app-preferences";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { useTheme } from "../../../style/theme-context";
import ModalContainer from "./ModalContainer";
import { NavigationProp } from "@react-navigation/native";
import { AVAILABLE_LANGUAGES, InternationalizationService } from "../../../control/i18n";

export default function LanguageSelectModal({ navigation }: { navigation: NavigationProp<any> }) {
    const { t, language } = useTranslation();

    const { theme } = useTheme();

    const changeLanguageAndSave = (value: string) => {
        AppPreferences.SetLanguage(value);
        InternationalizationService.ChangeLanguage(value);
    };

    const Styles = useThemedStyle(ModalPreferenceSelectStyles);

    const getButtons = (lng: string) => {
        return AVAILABLE_LANGUAGES.map(lngData => {
            const checkIcon = lngData.id === lng ? <FontAwesomeIcon icon="check" size={16} color={theme.text} /> : null;

            return (
                <View key={lngData.id} style={Styles.optionContainer}>
                    <TouchableOpacity
                        style={Styles.optionContainerTouchable}
                        onPress={() => {
                            changeLanguageAndSave(lngData.id);
                            navigation.goBack();
                        }}>
                        <View style={Styles.optionIconContainer}>{checkIcon}</View>
                        <View style={Styles.optionNameContainer}>
                            <Text style={Styles.optionNameText}>{lngData.name}</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            );
        });
    };

    return (
        <ModalContainer
            title={t("Select your language")}
            onClose={() => {
                navigation.goBack();
            }}>
            {getButtons(language)}
        </ModalContainer>
    );
}

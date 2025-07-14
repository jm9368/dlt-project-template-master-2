// Component: InitialScreen
// Initial screen displayed after the app installation, in order to set preferences

import { View, Text } from "react-native";
import AuthScreenBase from "./AuthScreenBase";
import AuthFormTitle from "./AuthFormTitle";
import { useTranslation } from "../../../hooks/translation";
import AppButton from "../../utils/AppButton";
import { useThemedStyle } from "../../../style/themed-style";
import AuthStyles from "../../../style/screens/auth";
import PreferenceButton from "../../utils/PreferenceButton";
import { renderLanguage } from "../../../utils/languages";
import { useTheme } from "../../../style/theme-context";
import DarkTheme from "../../../style/dark";
import { NavigationProp } from "@react-navigation/native";
import Constants from "expo-constants";
import { AppPreferences } from "../../../control/app-preferences";

export default function InitialScreen({ navigation }: { navigation: NavigationProp<any> }) {
    const { t, language } = useTranslation();

    const { theme } = useTheme();

    const renderTheme = (currentTheme: string) => {
        if (currentTheme === DarkTheme.id) {
            return t("Dark");
        } else {
            return t("Light");
        }
    };

    const Styles = useThemedStyle(AuthStyles);

    return (
        <AuthScreenBase>
            <AuthFormTitle>
                {t("Welcome to $APP_NAME").replace("$APP_NAME", Constants.expoConfig.extra.platform_name || "Platform")}
            </AuthFormTitle>

            <View style={Styles.descriptionTextContainer}>
                <Text style={Styles.descriptionText}>{t("Set up your preferences before starting.")}</Text>
            </View>

            <View style={Styles.preferencesContainer}>
                <View style={Styles.preferencesContainerItem}>
                    <PreferenceButton
                        icon="language"
                        name={t("Language")}
                        value={renderLanguage(language)}
                        arrow
                        onPress={() => navigation.navigate("LanguageSelectModal")}
                    />
                </View>
                <View style={Styles.preferencesContainerItem}>
                    <PreferenceButton
                        icon="moon"
                        name={t("Theme")}
                        value={renderTheme(theme.id)}
                        arrow
                        onPress={() => navigation.navigate("ThemeSelectModal")}
                    />
                </View>
            </View>

            <View style={Styles.buttonContainer}>
                <AppButton
                    title={t("Next")}
                    fullSize
                    onPress={() => {
                        AppPreferences.SetOnboardingScreensPassed();
                        navigation.navigate("AuthLoadingScreen");
                    }}
                    paddingH={10}
                />
            </View>
        </AuthScreenBase>
    );
}

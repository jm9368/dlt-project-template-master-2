// Component: SelectLanguageScreen

import { View, Text } from "react-native";

import { useTranslation } from "../../../hooks/translation";
import { useThemedStyle } from "../../../style/themed-style";
import { NavigationProp } from "@react-navigation/native";
import AccountSettingsBase from "./AccountSettingsBase";
import AccountSettingsScreensStyles from "../../../style/screens/account-settings";
import AppFormInputSelect from "../../utils/AppFormInputSelect";
import { AVAILABLE_LANGUAGES } from "../../../control/i18n";
import { useAuth } from "../../../hooks/auth";
import { useState } from "react";
import AppButton from "../../utils/AppButton";
import { Request } from "@asanrom/request-browser";
import { ApiAccount } from "../../../api/api-group-account";
import { AuthController } from "../../../control/auth";
import { NavigationCallbacks } from "../../../control/navigation-callbacks";
import { AppEvents } from "../../../control/app-events";

export default function SelectLanguageScreen({ navigation }: { navigation: NavigationProp<any> }) {
    const { t } = useTranslation();
    const [busy, setBusy] = useState(false);

    const langOptions = AVAILABLE_LANGUAGES.map(l => {
        return {
            id: l.id,
            name: l.name,
        };
    });

    const { userLocale } = useAuth();

    const [language, setLanguage] = useState(userLocale);

    const submit = () => {
        if (busy) {
            return;
        }

        setBusy(true);

        Request.Do(ApiAccount.ChangeLocale({ locale: language }))
            .onSuccess(() => {
                setBusy(false);
                NavigationCallbacks.ShowSuccessMessage(navigation, t("Success"), t("Account language successfully changed"));
                AuthController.CheckAuthStatus();
            })
            .onRequestError((err, handleErr) => {
                setBusy(false);
                handleErr(err, {
                    unauthorized: () => {
                        NavigationCallbacks.ShowErrorMessage(navigation, t("Error"), t("Unauthorized"));
                        AppEvents.Emit("unauthorized");
                        if (navigation.isFocused()) {
                            navigation.navigate("LoginScreen");
                        }
                    },
                    serverError: () => {
                        NavigationCallbacks.ShowErrorMessage(navigation, t("Error"), t("Internal server error"));
                    },
                    networkError: () => {
                        NavigationCallbacks.ShowErrorMessage(navigation, t("Error"), t("Could not connect to the server"));
                    },
                });
            })
            .onUnexpectedError(err => {
                setBusy(false);
                NavigationCallbacks.ShowErrorMessage(navigation, t("Error"), err.message);
            });
    };

    const Styles = useThemedStyle(AccountSettingsScreensStyles);

    return (
        <AccountSettingsBase current="SelectLanguageScreen" navigation={navigation} busy={busy}>
            <View>
                <View style={Styles.subTitleContainer}>
                    <Text style={Styles.subTitle}>{t("Select language")}</Text>
                </View>
                <View style={Styles.row}>
                    <Text style={Styles.text}>{t("This language is used to contact you via email.")}</Text>
                </View>

                <AppFormInputSelect
                    label={t("Select your language")}
                    options={langOptions}
                    navigation={navigation}
                    disabled={busy}
                    value={language}
                    setValue={v => {
                        setLanguage(v);
                    }}
                />

                <View style={Styles.row}>
                    <AppButton
                        paddingH={20}
                        disabled={busy || language === userLocale}
                        icon="save"
                        title={t("Save changes")}
                        onPress={submit}
                    />
                </View>
                <View style={Styles.row} />
            </View>
        </AccountSettingsBase>
    );
}

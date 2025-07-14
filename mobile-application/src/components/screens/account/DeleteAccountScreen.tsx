// Component: DeleteAccountScreen

import { View, Text } from "react-native";

import { useTranslation } from "../../../hooks/translation";
import { useThemedStyle } from "../../../style/themed-style";
import { NavigationProp } from "@react-navigation/native";
import AccountSettingsBase from "./AccountSettingsBase";
import AccountSettingsScreensStyles from "../../../style/screens/account-settings";
import { useAuth } from "../../../hooks/auth";
import { useState } from "react";
import { Request } from "@asanrom/request-browser";
import { ApiAccount } from "../../../api/api-group-account";
import { NavigationCallbacks } from "../../../control/navigation-callbacks";
import { AppEvents } from "../../../control/app-events";
import { AuthController } from "../../../control/auth";
import AppFormInput from "../../utils/AppFormInput";
import AppButton from "../../utils/AppButton";

export default function DeleteAccountScreen({ navigation }: { navigation: NavigationProp<any> }) {
    const { t } = useTranslation();

    const { tfaEnabled } = useAuth();

    const [busy, setBusy] = useState(false);

    const [password, setPassword] = useState("");
    const [errorPassword, setErrorPassword] = useState("");

    const [tfaToken, setTfaToken] = useState("");
    const [errorTfaToken, setErrorTfaToken] = useState("");

    const submit = () => {
        if (busy) {
            return;
        }

        setBusy(true);

        Request.Do(ApiAccount.DeleteAccount({ password, tfa_token: tfaToken }))
            .onSuccess(() => {
                setBusy(false);
                setPassword("");
                setTfaToken("");
                NavigationCallbacks.ShowSuccessMessage(navigation, t("Success"), t("Account deleted"));
                AuthController.CheckAuthStatus();
                navigation.navigate("LoginScreen");
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
                    badRequestInvalidTfaCode: () => {
                        setErrorTfaToken(t("Invalid one-time password"));
                    },
                    badRequestWrongPassword: () => {
                        setErrorPassword(t("Wrong password"));
                    },
                    badRequest: () => {
                        NavigationCallbacks.ShowErrorMessage(navigation, t("Error"), t("Bad request"));
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

    const askSubmit = () => {
        NavigationCallbacks.AskConfirmation(navigation, t("Delete account"), t("Are you sure you want to delete your account?"), () => {
            submit();
        });
    };

    const Styles = useThemedStyle(AccountSettingsScreensStyles);

    return (
        <AccountSettingsBase current="DeleteAccountScreen" navigation={navigation}>
            <View>
                <View style={Styles.subTitleContainer}>
                    <Text style={Styles.subTitle}>{t("Delete account")}</Text>
                </View>
                <AppFormInput
                    value={password}
                    setValue={v => {
                        setErrorPassword("");
                        setPassword(v);
                    }}
                    label={t("Input your account password to confirm this action")}
                    maxLength={255}
                    error={errorPassword}
                    isPassword
                    disabled={busy}
                />

                {tfaEnabled && (
                    <AppFormInput
                        value={tfaToken}
                        setValue={v => {
                            setErrorTfaToken("");
                            setTfaToken(v);
                        }}
                        label={t("Input your one-time password to confirm this action")}
                        maxLength={6}
                        error={errorTfaToken}
                        disabled={busy}
                    />
                )}

                <View style={Styles.row}>
                    <Text style={Styles.text}>{t("Warning: This action is not reversible.")}</Text>
                </View>

                <View style={Styles.row}>
                    <AppButton
                        paddingH={20}
                        kind="danger"
                        disabled={busy}
                        icon="trash-alt"
                        title={t("Delete account")}
                        onPress={askSubmit}
                    />
                </View>
                <View style={Styles.row} />
            </View>
        </AccountSettingsBase>
    );
}

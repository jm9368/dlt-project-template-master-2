// Component: ChangePasswordScreen

import { View, Text } from "react-native";

import { useTranslation } from "../../../hooks/translation";
import { useThemedStyle } from "../../../style/themed-style";
import { NavigationProp } from "@react-navigation/native";
import AccountSettingsBase from "./AccountSettingsBase";
import AccountSettingsScreensStyles from "../../../style/screens/account-settings";
import { useState } from "react";
import { Request } from "@asanrom/request-browser";
import { ApiAccount } from "../../../api/api-group-account";
import { AuthController } from "../../../control/auth";
import { NavigationCallbacks } from "../../../control/navigation-callbacks";
import { AppEvents } from "../../../control/app-events";
import AppFormInput from "../../utils/AppFormInput";
import AppButton from "../../utils/AppButton";

export default function ChangePasswordScreen({ navigation }: { navigation: NavigationProp<any> }) {
    const { t } = useTranslation();

    const [busy, setBusy] = useState(false);

    const [password, setPassword] = useState("");
    const [errorPassword, setErrorPassword] = useState("");

    const [newPassword, setNewPassword] = useState("");
    const [errorNewPassword, setErrorNewPassword] = useState("");

    const [newPassword2, setNewPassword2] = useState("");
    const [errorNewPassword2, setErrorNewPassword2] = useState("");

    const submit = () => {
        if (busy) {
            return;
        }

        if (!newPassword) {
            setErrorNewPassword(t("You must specify a password"));
            return;
        }

        if (newPassword !== newPassword2) {
            setErrorNewPassword2(t("The passwords do not match"));
            return;
        }

        setBusy(true);

        Request.Do(ApiAccount.ChangePassword({ new_password: newPassword, old_password: password }))
            .onSuccess(() => {
                setBusy(false);
                setNewPassword("");
                setNewPassword2("");
                setPassword("");
                NavigationCallbacks.ShowSuccessMessage(navigation, t("Success"), t("Password successfully changed"));
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
                    badRequestWeakPassword: () => {
                        setErrorNewPassword(t("The provided password is too short"));
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

    const Styles = useThemedStyle(AccountSettingsScreensStyles);

    return (
        <AccountSettingsBase current="ChangePasswordScreen" navigation={navigation} busy={busy}>
            <View>
                <View style={Styles.subTitleContainer}>
                    <Text style={Styles.subTitle}>{t("Change password")}</Text>
                </View>
                <AppFormInput
                    value={password}
                    setValue={v => {
                        setErrorPassword("");
                        setPassword(v);
                    }}
                    label={t("Current password")}
                    maxLength={255}
                    error={errorPassword}
                    isPassword
                    disabled={busy}
                />

                <AppFormInput
                    value={newPassword}
                    setValue={v => {
                        setErrorNewPassword("");
                        setErrorNewPassword2("");
                        setNewPassword(v);
                    }}
                    label={t("New password")}
                    maxLength={255}
                    error={errorNewPassword}
                    isPassword
                    disabled={busy}
                />

                <AppFormInput
                    value={newPassword2}
                    setValue={v => {
                        setErrorNewPassword2("");
                        setNewPassword2(v);
                    }}
                    label={t("Repeat the new password")}
                    maxLength={255}
                    error={errorNewPassword2}
                    isPassword
                    disabled={busy}
                />

                <View style={Styles.row}>
                    <AppButton paddingH={20} disabled={busy || !newPassword} icon="key" title={t("Change password")} onPress={submit} />
                </View>
                <View style={Styles.row} />
            </View>
        </AccountSettingsBase>
    );
}

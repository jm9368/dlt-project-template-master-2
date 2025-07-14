// Component: ChangeUsernameScreen

import { View, Text } from "react-native";

import { useTranslation } from "../../../hooks/translation";
import { useThemedStyle } from "../../../style/themed-style";
import { NavigationProp } from "@react-navigation/native";
import AccountSettingsBase from "./AccountSettingsBase";
import AccountSettingsScreensStyles from "../../../style/screens/account-settings";
import { useAuth } from "../../../hooks/auth";
import { useState } from "react";
import AppFormInput from "../../utils/AppFormInput";
import AppButton from "../../utils/AppButton";
import { Request } from "@asanrom/request-browser";
import { ApiAccount } from "../../../api/api-group-account";
import { NavigationCallbacks } from "../../../control/navigation-callbacks";
import { AuthController } from "../../../control/auth";
import { AppEvents } from "../../../control/app-events";

export default function ChangeUsernameScreen({ navigation }: { navigation: NavigationProp<any> }) {
    const { t } = useTranslation();

    const { username, tfaEnabled } = useAuth();

    const [busy, setBusy] = useState(false);

    const [newUsername, setNewUsername] = useState("");
    const [errorNewUsername, setErrorNewUsername] = useState("");

    const [password, setPassword] = useState("");
    const [errorPassword, setErrorPassword] = useState("");

    const [tfaToken, setTfaToken] = useState("");
    const [errorTfaToken, setErrorTfaToken] = useState("");

    const submit = () => {
        if (busy) {
            return;
        }

        setBusy(true);

        Request.Do(ApiAccount.ChangeUsername({ username: newUsername, password, tfa_token: tfaToken }))
            .onSuccess(() => {
                setBusy(false);
                setNewUsername("");
                setPassword("");
                setTfaToken("");
                NavigationCallbacks.ShowSuccessMessage(navigation, t("Success"), t("Username successfully changed"));
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
                    badRequestInvalidTfaCode: () => {
                        setErrorTfaToken(t("Invalid one-time password"));
                    },
                    badRequestUsernameInvalid: () => {
                        setErrorNewUsername(t("Invalid username provided"));
                    },
                    badRequestUsernameInUse: () => {
                        setErrorNewUsername(t("The provided username is already in use"));
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
        <AccountSettingsBase current="ChangeUsernameScreen" navigation={navigation} busy={busy}>
            <View>
                <View style={Styles.subTitleContainer}>
                    <Text style={Styles.subTitle}>{t("Change username")}</Text>
                </View>

                <AppFormInput value={username} label={t("Current username")} disabled />

                <AppFormInput
                    value={newUsername}
                    setValue={v => {
                        setErrorNewUsername("");
                        setNewUsername(v);
                    }}
                    label={t("New username")}
                    maxLength={80}
                    error={errorNewUsername}
                    disabled={busy}
                />

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
                    <AppButton
                        paddingH={20}
                        disabled={busy || !newUsername || newUsername === username}
                        icon="user-tag"
                        title={t("Change username")}
                        onPress={submit}
                    />
                </View>
                <View style={Styles.row} />
            </View>
        </AccountSettingsBase>
    );
}

// Component: ChangeEmailScreen

import { View, Text } from "react-native";

import { useTranslation } from "../../../hooks/translation";
import { useThemedStyle } from "../../../style/themed-style";
import { NavigationProp } from "@react-navigation/native";
import AccountSettingsBase from "./AccountSettingsBase";
import AccountSettingsScreensStyles from "../../../style/screens/account-settings";
import { useAuth } from "../../../hooks/auth";
import { useState } from "react";
import { NavigationCallbacks } from "../../../control/navigation-callbacks";
import { ApiAccount } from "../../../api/api-group-account";
import { Request } from "@asanrom/request-browser";
import { AuthController } from "../../../control/auth";
import { AppEvents } from "../../../control/app-events";
import { useCaptcha } from "../../../hooks/captcha";
import AppFormInput from "../../utils/AppFormInput";
import AppButton from "../../utils/AppButton";

const CAPTCHA_ACTION = "change_email";

export default function ChangeEmailScreen({ navigation }: { navigation: NavigationProp<any> }) {
    const { t } = useTranslation();

    const { email, tfaEnabled } = useAuth();

    const [busy, setBusy] = useState(false);

    const [newEmail, setNewEmail] = useState("");
    const [errorNewEmail, setErrorNewEmail] = useState("");

    const [password, setPassword] = useState("");
    const [errorPassword, setErrorPassword] = useState("");

    const [tfaToken, setTfaToken] = useState("");
    const [errorTfaToken, setErrorTfaToken] = useState("");

    const doSubmit = (captchaToken: string) => {
        if (busy) {
            return;
        }

        setBusy(true);

        Request.Do(ApiAccount.ChangeEmail({ email: newEmail, password, tfa_token: tfaToken, captcha: captchaToken }))
            .onSuccess(() => {
                setBusy(false);
                setNewEmail("");
                setPassword("");
                setTfaToken("");
                NavigationCallbacks.ShowSuccessMessage(
                    navigation,
                    t("Email change requested"),
                    t("Check your inbox for an email we have sent to your new email in order to verify it and complete the change"),
                );
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
                    badRequestEmailInvalid: () => {
                        setErrorNewEmail(t("Invalid email provided"));
                    },
                    badRequestEmailInUse: () => {
                        setErrorNewEmail(t("The provided email is already in use"));
                    },
                    badRequestCaptcha: () => {
                        NavigationCallbacks.ShowErrorMessage(
                            navigation,
                            t("Error"),
                            t("Please, prove you are not a robot by solving the captcha"),
                        );
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

    const getCaptcha = useCaptcha();

    const doCaptcha = () => {
        getCaptcha(CAPTCHA_ACTION).then(doSubmit);
    };

    const Styles = useThemedStyle(AccountSettingsScreensStyles);

    return (
        <AccountSettingsBase current="ChangeEmailScreen" navigation={navigation} busy={busy}>
            <View>
                <View style={Styles.subTitleContainer}>
                    <Text style={Styles.subTitle}>{t("Change email")}</Text>
                </View>
                <AppFormInput value={email} label={t("Current email")} disabled />

                <AppFormInput
                    value={newEmail}
                    setValue={v => {
                        setErrorNewEmail("");
                        setNewEmail(v);
                    }}
                    label={t("New email")}
                    maxLength={80}
                    error={errorNewEmail}
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
                        disabled={busy || !newEmail || newEmail === email}
                        icon="envelope"
                        title={t("Change email")}
                        onPress={doCaptcha}
                    />
                </View>
                <View style={Styles.row} />
            </View>
        </AccountSettingsBase>
    );
}

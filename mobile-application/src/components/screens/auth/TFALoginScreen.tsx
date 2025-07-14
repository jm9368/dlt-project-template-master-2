// Component: TFALoginScreen
// Login screen for the two factor

import { View } from "react-native";
import AuthScreenBase from "./AuthScreenBase";
import AuthFormTitle from "./AuthFormTitle";
import { useTranslation } from "../../../hooks/translation";
import AppButton from "../../utils/AppButton";
import { useThemedStyle } from "../../../style/themed-style";
import AuthStyles from "../../../style/screens/auth";
import { useState } from "react";
import AppFormInput from "../../utils/AppFormInput";
import TouchableLink from "../../utils/TouchableLink";
import { AuthController } from "../../../control/auth";
import { NavigationCallbacks } from "../../../control/navigation-callbacks";
import { NavigationProp } from "@react-navigation/native";
import { Request } from "@asanrom/request-browser";
import { ApiAuth } from "../../../api/api-group-auth";
import { useCaptcha } from "../../../hooks/captcha";

const CAPTCHA_ACTION = "tfa";

export default function TFALoginScreen({ navigation }: { navigation: NavigationProp<any> }) {
    const { t } = useTranslation();

    const Styles = useThemedStyle(AuthStyles);

    const [busy, setBusy] = useState(false);

    const [code, setCode] = useState("");

    const [errorCode, setErrorCode] = useState("");

    const doSubmit = (captchaToken?: string) => {
        if (busy) {
            return;
        }

        let hasError = false;

        if (!code) {
            setErrorCode(t("You must specify a code."));
            hasError = true;
        }

        if (hasError) {
            return;
        }

        setBusy(true);

        Request.Do(ApiAuth.LoginTFA({ captcha: captchaToken, token: code }))
            .onSuccess(() => {
                setBusy(false);
                AuthController.CheckAuthStatus();
                navigation.navigate("AuthLoadingScreen");
            })
            .onCancel(() => {
                setBusy(false);
            })
            .onRequestError((err, handleErr) => {
                setBusy(false);
                handleErr(err, {
                    unauthorized: () => {
                        AuthController.CheckAuthStatus();
                        navigation.navigate("AuthLoadingScreen");
                    },
                    badRequestCaptcha: () => {
                        NavigationCallbacks.ShowErrorMessage(
                            navigation,
                            t("Error"),
                            t("Please, prove you are not a robot by solving the captcha"),
                        );
                    },
                    badRequest: () => {
                        NavigationCallbacks.ShowErrorMessage(navigation, t("Error"), t("Invalid one-time password"));
                    },
                    forbiddenInvalidCode: () => {
                        NavigationCallbacks.ShowErrorMessage(
                            navigation,
                            t("Error"),
                            t("Please, prove you are not a robot by solving the captcha"),
                        );
                    },
                    forbidden: () => {
                        NavigationCallbacks.ShowErrorMessage(navigation, t("Error"), t("Invalid one-time password"));
                    },
                    notFound: () => {
                        AuthController.Logout();
                        navigation.navigate("AuthLoadingScreen");
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

    return (
        <AuthScreenBase>
            <AuthFormTitle>{t("Login")}</AuthFormTitle>

            <AppFormInput
                value={code}
                setValue={v => {
                    setErrorCode("");
                    setCode(v);
                }}
                label={t("Input two factor authentication code")}
                placeholder="********"
                isPassword
                icon="lock"
                maxLength={255}
                error={errorCode}
                disabled={busy}
            />

            <View style={Styles.buttonContainer}>
                <AppButton title={t("Login")} fullSize onPress={doCaptcha} disabled={busy} paddingH={10} />
            </View>

            <View style={Styles.bottomTextRow}>
                <TouchableLink
                    onPress={() => {
                        AuthController.Logout();
                        navigation.navigate("LoginScreen");
                    }}>
                    {t("Log out")}
                </TouchableLink>
            </View>
        </AuthScreenBase>
    );
}

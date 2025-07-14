// Component: ForgotPasswordScreen
// Screen to ask for a password reset code

import { View, Text } from "react-native";
import AuthScreenBase from "./AuthScreenBase";
import AuthFormTitle from "./AuthFormTitle";
import { useTranslation } from "../../../hooks/translation";
import AppButton from "../../utils/AppButton";
import { useThemedStyle } from "../../../style/themed-style";
import AuthStyles from "../../../style/screens/auth";
import TouchableLink from "../../utils/TouchableLink";
import AppFormInput from "../../utils/AppFormInput";
import { useState } from "react";
import { NavigationCallbacks } from "../../../control/navigation-callbacks";
import { NavigationProp } from "@react-navigation/native";
import { Request } from "@asanrom/request-browser";
import { ApiAuth } from "../../../api/api-group-auth";
import { useCaptcha } from "../../../hooks/captcha";

const CAPTCHA_ACTION = "forgot_password";

export default function ForgotPasswordScreen({ navigation }: { navigation: NavigationProp<any> }) {
    const { t } = useTranslation();

    const [busy, setBusy] = useState(false);

    const [email, setEmail] = useState("");

    const [errorEmail, setErrorEmail] = useState("");

    const doSubmit = (captchaToken?: string) => {
        if (busy) {
            return;
        }

        let hasError = false;

        if (!email) {
            setErrorEmail(t("You must specify an email."));
            hasError = true;
        }

        if (hasError) {
            return;
        }

        setBusy(true);

        Request.Do(ApiAuth.RequestPasswordReset({ email, captcha: captchaToken }))
            .onSuccess(() => {
                setBusy(false);
                NavigationCallbacks.ShowSuccessMessage(
                    navigation,
                    t("Success"),
                    t("We have sent an email with the instructions in order to reset your password."),
                    "LoginScreen",
                );
            })
            .onCancel(() => {
                setBusy(false);
            })
            .onRequestError((err, handleErr) => {
                setBusy(false);
                handleErr(err, {
                    badRequestCaptcha: () => {
                        NavigationCallbacks.ShowErrorMessage(
                            navigation,
                            t("Error"),
                            t("Please, prove you are not a robot by solving the captcha"),
                        );
                    },
                    badRequestEmailInvalid: () => {
                        NavigationCallbacks.ShowErrorMessage(navigation, t("Error"), t("Invalid email provided"));
                    },
                    badRequest: () => {
                        NavigationCallbacks.ShowErrorMessage(navigation, t("Error"), t("Invalid email provided"));
                    },
                    notFound: () => {
                        NavigationCallbacks.ShowErrorMessage(
                            navigation,
                            t("Error"),
                            t("We did not find any account with the provided email"),
                        );
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

    const Styles = useThemedStyle(AuthStyles);

    return (
        <AuthScreenBase>
            <AuthFormTitle>{t("Forgot your password?")}</AuthFormTitle>

            <View style={Styles.descriptionTextContainer}>
                <Text style={Styles.descriptionText}>{t("Input your email and we will send you an email to reset your password.")}</Text>
            </View>

            <AppFormInput
                value={email}
                setValue={v => {
                    setErrorEmail("");
                    setEmail(v);
                }}
                label={t("Email")}
                placeholder={t("user@example.com")}
                icon="envelope"
                maxLength={255}
                error={errorEmail}
                disabled={busy}
            />

            <View style={Styles.buttonContainer}>
                <AppButton title={t("Submit")} fullSize onPress={doCaptcha} disabled={busy} paddingH={10} />
            </View>

            <View style={Styles.bottomTextRow}>
                <TouchableLink
                    onPress={() => {
                        navigation.navigate("LoginScreen");
                    }}>
                    {t("Back to login form")}
                </TouchableLink>
            </View>
        </AuthScreenBase>
    );
}

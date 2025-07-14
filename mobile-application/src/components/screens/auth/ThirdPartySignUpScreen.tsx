// Component: ThirdPartySignUpScreen
// Screen to create a new account with a third party

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
import { AuthController } from "../../../control/auth";
import { NavigationCallbacks } from "../../../control/navigation-callbacks";
import { NavigationProp, useRoute } from "@react-navigation/native";
import { ApiAuth } from "../../../api/api-group-auth";
import { Request } from "@asanrom/request-browser";

export default function ThirdPartySignUpScreen({ navigation }: { navigation: NavigationProp<any> }) {
    const { t, language } = useTranslation();

    const Styles = useThemedStyle(AuthStyles);

    const [busy, setBusy] = useState(false);

    const route = useRoute();

    const email = (route.params as any)["email"] || "";
    const id = (route.params as any)["id"] || "";
    const token = (route.params as any)["token"] || "";

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [password2, setPassword2] = useState("");

    const [errorEmail] = useState("");
    const [errorUsername, setErrorUsername] = useState("");
    const [errorPassword, setErrorPassword] = useState("");
    const [errorPassword2, setErrorPassword2] = useState("");

    const doSignUp = () => {
        if (busy) {
            return;
        }

        let hasError = false;

        if (!username) {
            setErrorUsername(t("You must specify an username."));
            hasError = true;
        }

        if (!password) {
            setErrorPassword(t("You must specify a password."));
            hasError = true;
        }

        if (!password2) {
            setErrorPassword2(t("You must specify a password."));
            hasError = true;
        }

        if (password !== password2) {
            setErrorPassword2(t("The passwords do not match"));
            hasError = true;
        }

        if (hasError) {
            return;
        }

        setBusy(true);

        Request.Do(ApiAuth.ThirdPartyRegister({ id, token, username, password, locale: language }))
            .onSuccess(response => {
                setBusy(false);
                if (response.session_id) {
                    AuthController.SetSession(response.session_id);
                    navigation.navigate("AuthLoadingScreen");
                    return;
                }
                NavigationCallbacks.ShowSuccessMessage(
                    navigation,
                    t("Success! You account was created!"),
                    t("Check your email and follow the verification link we sent you."),
                    "AuthLoadingScreen",
                );
            })
            .onCancel(() => {
                setBusy(false);
            })
            .onRequestError((err, handleErr) => {
                setBusy(false);
                handleErr(err, {
                    badRequestIdInvalid: () => {
                        NavigationCallbacks.ShowErrorMessage(
                            navigation,
                            t("Error"),
                            t("This registration link is no longer valid. Go back to the sign up form and try again."),
                        );
                    },
                    badRequestTokenInvalid: () => {
                        NavigationCallbacks.ShowErrorMessage(
                            navigation,
                            t("Error"),
                            t("This registration link is no longer valid. Go back to the sign up form and try again."),
                        );
                    },
                    badRequestUsernameInvalid: () => {
                        NavigationCallbacks.ShowErrorMessage(navigation, t("Error"), t("Invalid username provided"));
                    },
                    badRequestUsernameInUse: () => {
                        NavigationCallbacks.ShowErrorMessage(navigation, t("Error"), t("The provided username is already in use"));
                    },
                    badRequestWeakPassword: () => {
                        NavigationCallbacks.ShowErrorMessage(navigation, t("Error"), t("The provided password is too short"));
                    },
                    badRequestEmailInUse: () => {
                        NavigationCallbacks.ShowErrorMessage(navigation, t("Error"), t("The provided email is already in use"));
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

    return (
        <AuthScreenBase>
            <AuthFormTitle>{t("Create an account")}</AuthFormTitle>

            <AppFormInput
                value={email}
                setValue={() => {}}
                label={t("Email")}
                placeholder={t("user@example.com")}
                icon="envelope"
                maxLength={255}
                disabled
                error={errorEmail}
            />

            <AppFormInput
                value={username}
                setValue={v => {
                    setUsername(v);
                    setErrorUsername("");
                }}
                label={t("Username")}
                placeholder={t("Username")}
                icon="user"
                maxLength={255}
                disabled={busy}
                error={errorUsername}
            />

            <AppFormInput
                value={password}
                setValue={v => {
                    setPassword(v);
                    setErrorPassword("");
                }}
                label={t("Password")}
                placeholder="********"
                isPassword
                icon="lock"
                maxLength={255}
                disabled={busy}
                error={errorPassword}
            />

            <AppFormInput
                value={password2}
                setValue={v => {
                    setPassword2(v);
                    setErrorPassword2("");
                }}
                label={t("Repeat the password")}
                placeholder="********"
                isPassword
                icon="lock"
                maxLength={255}
                disabled={busy}
                error={errorPassword2}
            />

            <View style={Styles.buttonContainer}>
                <AppButton title={t("Create account")} fullSize onPress={doSignUp} disabled={busy} paddingH={10} />
            </View>

            <View style={Styles.bottomTextRow}>
                <Text style={Styles.bottomText}>{t("Do you already have an account?")} </Text>
                <TouchableLink
                    onPress={() => {
                        navigation.navigate("LoginScreen");
                    }}>
                    {t("Login")}
                </TouchableLink>
            </View>
        </AuthScreenBase>
    );
}

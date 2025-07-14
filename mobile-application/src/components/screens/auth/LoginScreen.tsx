// Component: LoginScreen
// Login screen

import { View, Text } from "react-native";
import AuthScreenBase from "./AuthScreenBase";
import AuthFormTitle from "./AuthFormTitle";
import { useTranslation } from "../../../hooks/translation";
import AppButton from "../../utils/AppButton";
import { useThemedStyle } from "../../../style/themed-style";
import AuthStyles from "../../../style/screens/auth";
import { useEffect, useState } from "react";
import AppFormInput from "../../utils/AppFormInput";
import TouchableLink from "../../utils/TouchableLink";
import { AuthController } from "../../../control/auth";
import { NavigationCallbacks } from "../../../control/navigation-callbacks";
import { NavigationProp } from "@react-navigation/native";
import { ApiAuth } from "../../../api/api-group-auth";
import { Request } from "@asanrom/request-browser";
import { getUniqueStringId } from "../../../utils/unique-id";
import { Timeouts } from "../../../utils/timeout";
import { ThirdPartyLoginService } from "../../../api/definitions";
import { useCaptcha } from "../../../hooks/captcha";

const CAPTCHA_ACTION = "login";

export default function LoginScreen({ navigation }: { navigation: NavigationProp<any> }) {
    const { t } = useTranslation();

    const Styles = useThemedStyle(AuthStyles);

    const tpLoadRequestId = getUniqueStringId();

    const [busy, setBusy] = useState(false);

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const [errorUsername, setErrorUsername] = useState("");
    const [errorPassword, setErrorPassword] = useState("");

    const [tpServices, setTpServices] = useState<ThirdPartyLoginService[]>([]);

    const doSubmit = (captchaToken?: string) => {
        if (busy) {
            return;
        }

        let hasError = false;

        if (!username) {
            setErrorUsername(t("You must specify an username or an email."));
            hasError = true;
        }

        if (!password) {
            setErrorPassword(t("You must specify a password."));
            hasError = true;
        }

        if (hasError) {
            return;
        }

        setBusy(true);

        Request.Do(ApiAuth.Login({ username, password, captcha: captchaToken, remember: true }))
            .onSuccess(response => {
                setBusy(false);
                AuthController.SetSession(response.session_id);
                navigation.navigate("AuthLoadingScreen");
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
                    badRequestInvalidCredentials: () => {
                        NavigationCallbacks.ShowErrorMessage(navigation, t("Error"), t("Invalid username or password"));
                    },
                    badRequest: () => {
                        NavigationCallbacks.ShowErrorMessage(navigation, t("Error"), t("Invalid username or password"));
                    },
                    forbiddenCaptcha: () => {
                        NavigationCallbacks.ShowErrorMessage(
                            navigation,
                            t("Error"),
                            t("Please, prove you are not a robot by solving the captcha"),
                        );
                    },
                    forbiddenInvalidCredentials: () => {
                        NavigationCallbacks.ShowErrorMessage(navigation, t("Error"), t("Invalid username or password"));
                    },
                    forbiddenUserBanned: () => {
                        NavigationCallbacks.ShowErrorMessage(
                            navigation,
                            t("Error"),
                            t("The user you are trying to log into is banned from the platform"),
                        );
                    },
                    forbidden: () => {
                        NavigationCallbacks.ShowErrorMessage(navigation, t("Error"), t("Invalid username or password"));
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

    const loadTp = () => {
        Timeouts.Abort(tpLoadRequestId);

        Request.Pending(tpLoadRequestId, ApiAuth.ThirdPartyLoginDetails())
            .onSuccess(tpServices => {
                setTpServices(tpServices);
            })
            .onRequestError((err, handleErr) => {
                handleErr(err, {
                    temporalError: () => {
                        Timeouts.Set(tpLoadRequestId, 1500, () => {
                            loadTp();
                        });
                    },
                });
            })
            .onUnexpectedError(() => {
                Timeouts.Set(tpLoadRequestId, 1500, () => {
                    loadTp();
                });
            });
    };

    const doLoginWithThirdPartyService = (service: string, code: string) => {
        if (busy) {
            return;
        }

        setBusy(true);

        Request.Do(ApiAuth.ThirdPartyLogin({ service, code }))
            .onSuccess(res => {
                setBusy(false);
                if (res.result === "SESSION") {
                    AuthController.SetSession(res.session_id);
                    navigation.navigate("AuthLoadingScreen");
                } else {
                    navigation.navigate("ThirdPartySignUpScreen", {
                        id: res.id,
                        email: res.email,
                        token: res.token,
                    });
                }
            })
            .onRequestError((err, handleErr) => {
                setBusy(false);
                handleErr(err, {
                    badRequestBanned: () => {
                        NavigationCallbacks.ShowErrorMessage(
                            navigation,
                            t("Error"),
                            t("The user you are trying to log into is banned from the platform"),
                        );
                    },
                    badRequestOauthError: () => {
                        NavigationCallbacks.ShowErrorMessage(
                            navigation,
                            t("Error"),
                            t("Could not login with OAuth 2.0. Maybe the service is misconfigured?"),
                        );
                    },
                    badRequestServiceInvalid: () => {
                        NavigationCallbacks.ShowErrorMessage(navigation, t("Error"), t("Invalid login service provided in the URL"));
                    },
                    badRequestNoCode: () => {
                        NavigationCallbacks.ShowErrorMessage(
                            navigation,
                            t("Error"),
                            t("Invalid code. This could be caused due to a configuration error."),
                        );
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
                console.error(err);
                NavigationCallbacks.ShowErrorMessage(navigation, t("Error"), err.message);
            });
    };

    const loginWithTp = (tp: ThirdPartyLoginService) => {
        if (busy) {
            return;
        }
        NavigationCallbacks.OpenWebView(
            navigation,
            tp.url,
            t("Login with") + " " + tp.name,
            u => u.startsWith(tp.redirect_url),
            url => {
                try {
                    const parsedURL = new URL(url);
                    const code = parsedURL.searchParams.get("code") || "";
                    doLoginWithThirdPartyService(tp.id, code);
                } catch (ex) {
                    console.error(ex);
                    NavigationCallbacks.ShowErrorMessage(navigation, t("Error"), ex.message);
                }
            },
        );
    };

    useEffect(() => {
        loadTp();

        return () => {
            Timeouts.Abort(tpLoadRequestId);
            Request.Abort(tpLoadRequestId);
        };
    }, []);

    return (
        <AuthScreenBase>
            <AuthFormTitle>{t("Login")}</AuthFormTitle>

            <AppFormInput
                value={username}
                setValue={v => {
                    setErrorUsername("");
                    setUsername(v);
                }}
                label={t("Username or email")}
                placeholder={t("user@example.com")}
                icon="envelope"
                maxLength={255}
                error={errorUsername}
                disabled={busy}
            />

            <AppFormInput
                value={password}
                setValue={v => {
                    setErrorPassword("");
                    setPassword(v);
                }}
                label={t("Password")}
                placeholder="********"
                isPassword
                rightLinkText={t("Forgot your password?")}
                rightLinkOnPress={() => {
                    navigation.navigate("ForgotPasswordScreen");
                }}
                icon="lock"
                maxLength={255}
                error={errorPassword}
                disabled={busy}
            />

            <View style={Styles.buttonContainer}>
                <AppButton title={t("Login")} fullSize onPress={doCaptcha} disabled={busy} paddingH={10} />
            </View>

            <View style={Styles.bottomTextRow}>
                <Text style={Styles.bottomText}>{t("Do you not have an account?")} </Text>
                <TouchableLink
                    onPress={() => {
                        navigation.navigate("SignUpScreen");
                    }}>
                    {t("Create account")}
                </TouchableLink>
            </View>

            {tpServices.map(service => {
                return (
                    <View style={Styles.thirdPartyLinkContainer} key={service.id}>
                        <TouchableLink
                            onPress={() => {
                                loginWithTp(service);
                            }}>
                            {t("Login with") + " " + service.name}
                        </TouchableLink>
                    </View>
                );
            })}
        </AuthScreenBase>
    );
}

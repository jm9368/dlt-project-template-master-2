// Component: TwoFactorAuthenticationScreen

import { View, Text, ActivityIndicator } from "react-native";

import { useTranslation } from "../../../hooks/translation";
import { useThemedStyle } from "../../../style/themed-style";
import { NavigationProp } from "@react-navigation/native";
import AccountSettingsBase from "./AccountSettingsBase";
import AccountSettingsScreensStyles from "../../../style/screens/account-settings";
import { useAuth } from "../../../hooks/auth";
import { useEffect, useState } from "react";
import { getUniqueStringId } from "../../../utils/unique-id";
import { Timeouts } from "../../../utils/timeout";
import { AppEvents } from "../../../control/app-events";
import { Request } from "@asanrom/request-browser";
import { ApiAccount } from "../../../api/api-group-account";

import QRCode from "react-qr-code";
import AppFormInput from "../../utils/AppFormInput";
import AppButton from "../../utils/AppButton";
import { AuthController } from "../../../control/auth";
import { NavigationCallbacks } from "../../../control/navigation-callbacks";
import { useTheme } from "../../../style/theme-context";

export default function TwoFactorAuthenticationScreen({ navigation }: { navigation: NavigationProp<any> }) {
    const { t } = useTranslation();

    const [loadRequestId] = useState(getUniqueStringId());

    const [loading, setLoading] = useState(true);

    const { tfaEnabled } = useAuth();

    const [uri, setUri] = useState("");
    const [secret, setSecret] = useState("");

    const [password, setPassword] = useState("");
    const [errorPassword, setErrorPassword] = useState("");

    const [tfaToken, setTfaToken] = useState("");
    const [errorTfaToken, setErrorTfaToken] = useState("");

    const [busy, setBusy] = useState(false);

    const load = () => {
        setLoading(true);

        Timeouts.Abort(loadRequestId);

        Request.Pending(loadRequestId, ApiAccount.GenerateTFA())
            .onSuccess(response => {
                setLoading(false);

                setUri(response.uri);
                setSecret(response.secret);

                setTfaToken("");
                setErrorTfaToken("");

                setPassword("");
                setErrorPassword("");
            })
            .onRequestError((err, handleErr) => {
                handleErr(err, {
                    unauthorized: () => {
                        AppEvents.Emit("unauthorized");
                        if (navigation.isFocused()) {
                            navigation.navigate("LoginScreen");
                        }
                    },
                    temporalError: () => {
                        Timeouts.Set(loadRequestId, 1500, load);
                    },
                });
            })
            .onUnexpectedError(err => {
                console.error(err);
                Timeouts.Set(loadRequestId, 1500, load);
            });
    };

    useEffect(() => {
        load();

        return () => {
            Timeouts.Abort(loadRequestId);
            Request.Abort(loadRequestId);
        };
    }, []);

    const enableTFA = () => {
        if (busy) {
            return;
        }

        setBusy(true);

        Request.Do(ApiAccount.SetupTFA({ secret, token: tfaToken, password }))
            .onSuccess(() => {
                setBusy(false);
                setPassword("");
                setTfaToken("");
                NavigationCallbacks.ShowSuccessMessage(navigation, t("Success"), t("Two factor authentication successfully enabled"));
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
                    badRequestInvalid: () => {
                        setErrorTfaToken(t("Invalid one-time password"));
                    },
                    badRequestAlready: () => {
                        NavigationCallbacks.ShowErrorMessage(
                            navigation,
                            t("Error"),
                            t("Two factor authentication is already enabled for this account"),
                        );
                        AuthController.CheckAuthStatus();
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

    const disableTFA = () => {
        if (busy) {
            return;
        }

        setBusy(true);

        Request.Do(ApiAccount.RemoveTFA({ token: tfaToken }))
            .onSuccess(() => {
                setBusy(false);
                setPassword("");
                setTfaToken("");
                NavigationCallbacks.ShowSuccessMessage(navigation, t("Success"), t("Two factor authentication successfully disabled"));
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
                    badRequestInvalid: () => {
                        setErrorTfaToken(t("Invalid one-time password"));
                    },
                    badRequestNotEnabled: () => {
                        NavigationCallbacks.ShowErrorMessage(
                            navigation,
                            t("Error"),
                            t("Two factor authentication is not enabled for this account"),
                        );
                        AuthController.CheckAuthStatus();
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

    const { theme } = useTheme();

    const Styles = useThemedStyle(AccountSettingsScreensStyles);

    return (
        <AccountSettingsBase
            current="TwoFactorAuthenticationScreen"
            navigation={navigation}
            refreshing={loading}
            onRefresh={() => {
                load();
            }}
            busy={busy}>
            {loading ? (
                <ActivityIndicator size="large" color={theme.activityIndicatorColor} />
            ) : (
                <View>
                    <View style={Styles.subTitleContainer}>
                        <Text style={Styles.subTitle}>{t("Two factor authentication")}</Text>
                    </View>
                    {tfaEnabled ? (
                        <View>
                            <View style={Styles.row}>
                                <Text style={Styles.text}>{t("Two factor authentication is enabled for your account")}</Text>

                                <AppFormInput
                                    value={tfaToken}
                                    setValue={v => {
                                        setErrorTfaToken("");
                                        setTfaToken(v);
                                    }}
                                    label={t("Input your one-time password")}
                                    maxLength={255}
                                    isPassword
                                    disabled={busy}
                                    error={errorTfaToken}
                                />

                                <View style={Styles.row}>
                                    <AppButton
                                        paddingH={20}
                                        disabled={busy}
                                        kind="danger"
                                        icon="lock-open"
                                        title={t("Disable two factor authentication")}
                                        onPress={disableTFA}
                                    />
                                </View>
                                <View style={Styles.row} />
                            </View>
                        </View>
                    ) : (
                        <View>
                            <View style={Styles.qrCodeLabel}>
                                <Text style={Styles.label}>{t("Scan this QR code with your authentication app")}</Text>
                                <View style={Styles.qrCode}>
                                    <QRCode size={150} value={uri} />
                                </View>
                            </View>

                            <AppFormInput
                                value={secret}
                                label={t("This is the corresponding TOTP secret (for security backup)")}
                                maxLength={255}
                                disabled
                            />

                            <AppFormInput
                                value={tfaToken}
                                setValue={v => {
                                    setErrorTfaToken("");
                                    setTfaToken(v);
                                }}
                                label={t("Input your one-time password")}
                                maxLength={255}
                                isPassword
                                disabled={busy}
                                error={errorTfaToken}
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

                            <View style={Styles.row}>
                                <Text style={Styles.text}>
                                    {t("Warning: By enabling two factor authentication, all your sessions will be closed.")}
                                </Text>
                            </View>

                            <View style={Styles.row}>
                                <AppButton
                                    paddingH={20}
                                    disabled={busy}
                                    icon="lock"
                                    title={t("Enable two factor authentications")}
                                    onPress={enableTFA}
                                />
                            </View>
                            <View style={Styles.row} />
                        </View>
                    )}
                </View>
            )}
        </AccountSettingsBase>
    );
}

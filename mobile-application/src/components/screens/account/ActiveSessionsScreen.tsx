// Component: ActiveSessionsScreen

import { View, Text, ActivityIndicator } from "react-native";

import { useTranslation } from "../../../hooks/translation";
import { useThemedStyle } from "../../../style/themed-style";
import { NavigationProp } from "@react-navigation/native";
import AccountSettingsBase from "./AccountSettingsBase";
import AccountSettingsScreensStyles from "../../../style/screens/account-settings";
import { useEffect, useState } from "react";
import { getUniqueStringId } from "../../../utils/unique-id";
import { useTheme } from "../../../style/theme-context";
import { SessionListItem } from "../../../api/definitions";
import { Timeouts } from "../../../utils/timeout";
import { Request } from "@asanrom/request-browser";
import { ApiAccount } from "../../../api/api-group-account";
import { useAuth } from "../../../hooks/auth";
import { AppEvents } from "../../../control/app-events";
import AppButton from "../../utils/AppButton";
import { NavigationCallbacks } from "../../../control/navigation-callbacks";
import { AuthController } from "../../../control/auth";
import { renderDateAndTime } from "../../../utils/time-utils";

export default function ActiveSessionsScreen({ navigation }: { navigation: NavigationProp<any> }) {
    const { t } = useTranslation();

    const [loadRequestId] = useState(getUniqueStringId());

    const { session } = useAuth();

    const { theme } = useTheme();

    const [loading, setLoading] = useState(true);

    const [sessions, setSessions] = useState<SessionListItem[]>([]);

    const [busy, setBusy] = useState(false);

    const load = () => {
        setLoading(true);

        Timeouts.Abort(loadRequestId);

        Request.Pending(loadRequestId, ApiAccount.GetSessions())
            .onSuccess(response => {
                setLoading(false);
                setSessions(response);
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
    }, [session]);

    const closeAllSessions = () => {
        if (busy) {
            return;
        }

        setBusy(true);

        Request.Do(ApiAccount.CloseAllSessions())
            .onSuccess(() => {
                setBusy(false);
                NavigationCallbacks.ShowSuccessMessage(navigation, t("Success"), t("All active sessions closed"));
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

    const askCloseAllSession = () => {
        NavigationCallbacks.AskConfirmation(navigation, t("Close all sessions"), t("Do you want to close all the active sessions?"), () => {
            closeAllSessions();
        });
    };

    const closeSession = (s: string) => {
        if (busy) {
            return;
        }

        setBusy(true);

        Request.Do(ApiAccount.CloseSession(s))
            .onSuccess(() => {
                setBusy(false);
                NavigationCallbacks.ShowSuccessMessage(navigation, t("Success"), t("Remote device session removed"));
                setSessions(sessions.filter(ss => ss.session !== s));
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
        <AccountSettingsBase
            current="ActiveSessionsScreen"
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
                        <Text style={Styles.subTitle}>{t("Active sessions")}</Text>
                    </View>

                    {sessions.map(s => {
                        return (
                            <View key={s.session} style={Styles.sessionContainer}>
                                <View style={Styles.sessionContainerInner}>
                                    <View style={Styles.sessionDetailRow}>
                                        <Text style={Styles.sessionDetail}>
                                            {t("Date")}: {renderDateAndTime(s.created, t)}
                                        </Text>
                                    </View>
                                    <View style={Styles.sessionDetailRow}>
                                        <Text style={Styles.sessionDetail}>
                                            {t("IP address")}: {s.remote}
                                        </Text>
                                    </View>
                                    <View style={Styles.sessionDetailRow}>
                                        <Text style={Styles.sessionDetail}>
                                            {t("Operating system")}: {s.os}
                                        </Text>
                                    </View>
                                    <View style={Styles.sessionDetailRow}>
                                        <Text style={Styles.sessionDetail}>
                                            {t("Web browser")}: {s.browser}
                                        </Text>
                                    </View>
                                    {s.current ? (
                                        <View style={Styles.sessionDetailRow}>
                                            <Text style={Styles.sessionDetail}>({t("Current session")})</Text>
                                        </View>
                                    ) : (
                                        <View style={Styles.sessionOptionsRow}>
                                            <AppButton
                                                title={t("Close session")}
                                                kind="danger"
                                                onPress={() => {
                                                    closeSession(s.session);
                                                }}
                                                paddingH={10}
                                                size={14}
                                                icon="trash-alt"
                                            />
                                        </View>
                                    )}
                                </View>
                            </View>
                        );
                    })}

                    <View style={Styles.row}>
                        <AppButton
                            paddingH={20}
                            disabled={busy}
                            kind="danger"
                            icon="trash-alt"
                            title={t("Close all sessions")}
                            onPress={askCloseAllSession}
                        />
                    </View>
                    <View style={Styles.row} />
                </View>
            )}
        </AccountSettingsBase>
    );
}

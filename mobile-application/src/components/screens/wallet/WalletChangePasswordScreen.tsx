// Component: WalletDetailsScreen

import { View, Text, ActivityIndicator } from "react-native";

import { useTranslation } from "../../../hooks/translation";
import { useThemedStyle } from "../../../style/themed-style";
import { NavigationProp, useRoute } from "@react-navigation/native";
import WalletSettingsBase from "./WalletSettingsBase";
import WalletSettingsScreensStyles from "../../../style/screens/wallet-settings";
import { useWalletDetails } from "../../../hooks/wallet-details";
import { useTheme } from "../../../style/theme-context";
import { useState } from "react";
import { NavigationCallbacks } from "../../../control/navigation-callbacks";
import { Request } from "@asanrom/request-browser";
import { ApiWallet } from "../../../api/api-group-wallet";
import { AppEvents } from "../../../control/app-events";
import AppFormInput from "../../utils/AppFormInput";
import AppButton from "../../utils/AppButton";

export default function WalletChangePasswordScreen({ navigation }: { navigation: NavigationProp<any> }) {
    const { t } = useTranslation();

    const { theme } = useTheme();

    const route = useRoute();

    const walletId = (route.params as any)["id"] || "";

    const { loading, load, notFound, walletName } = useWalletDetails(navigation, walletId);

    const [password, setPassword] = useState("");
    const [errorPassword, setErrorPassword] = useState("");

    const [newPassword, setNewPassword] = useState("");
    const [errorNewPassword, setErrorNewPassword] = useState("");

    const [newPassword2, setNewPassword2] = useState("");
    const [errorNewPassword2, setErrorNewPassword2] = useState("");

    const [busy, setBusy] = useState(false);

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

        Request.Do(ApiWallet.ChangeWalletPassword(walletId, { password, new_password: newPassword }))
            .onSuccess(() => {
                setBusy(false);
                setNewPassword("");
                setNewPassword2("");
                setPassword("");
                NavigationCallbacks.ShowSuccessMessage(navigation, t("Success"), t("Password successfully changed"));
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
                    notFound: () => {
                        NavigationCallbacks.ShowErrorMessage(navigation, t("Error"), t("Not found"));
                        load();
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

    const Styles = useThemedStyle(WalletSettingsScreensStyles);

    return (
        <WalletSettingsBase
            current="WalletChangePasswordScreen"
            navigation={navigation}
            refreshing={loading}
            onRefresh={() => {
                load();
            }}
            walletId={walletId}
            walletName={walletName}
            walletLoaded={!loading}
            busy={busy}>
            {loading ? (
                <ActivityIndicator size="large" color={theme.activityIndicatorColor} />
            ) : notFound ? (
                <View>
                    <View style={Styles.subTitleContainer}>
                        <Text style={Styles.subTitle}>{t("Wallet not found")}</Text>
                    </View>
                    <View style={Styles.row}>
                        <Text style={Styles.text}>{t("The wallet you are looking for was not found")}</Text>
                    </View>
                </View>
            ) : (
                <View>
                    <View style={Styles.subTitleContainer}>
                        <Text style={Styles.subTitle}>{t("Change wallet password")}</Text>
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
                        <AppButton
                            paddingH={20}
                            disabled={busy || !newPassword}
                            icon="key"
                            title={t("Change wallet password")}
                            onPress={submit}
                        />
                    </View>
                    <View style={Styles.row} />
                </View>
            )}
        </WalletSettingsBase>
    );
}

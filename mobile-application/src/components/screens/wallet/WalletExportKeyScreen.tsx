// Component: WalletDetailsScreen

import { View, Text, ActivityIndicator } from "react-native";

import { useTranslation } from "../../../hooks/translation";
import { useThemedStyle } from "../../../style/themed-style";
import { NavigationProp, useRoute } from "@react-navigation/native";
import WalletSettingsBase from "./WalletSettingsBase";
import WalletSettingsScreensStyles from "../../../style/screens/wallet-settings";
import { useWalletDetails } from "../../../hooks/wallet-details";
import { useTheme } from "../../../style/theme-context";
import { useEffect, useState } from "react";
import { Request } from "@asanrom/request-browser";
import { ApiWallet } from "../../../api/api-group-wallet";
import { NavigationCallbacks } from "../../../control/navigation-callbacks";
import { AppEvents } from "../../../control/app-events";
import * as Clipboard from "expo-clipboard";
import AppFormInput from "../../utils/AppFormInput";
import AppButton from "../../utils/AppButton";

export default function WalletExportKeyScreen({ navigation }: { navigation: NavigationProp<any> }) {
    const { t } = useTranslation();

    const { theme } = useTheme();

    const route = useRoute();

    const walletId = (route.params as any)["id"] || "";

    const { loading, load, notFound, walletName, walletAddress } = useWalletDetails(navigation, walletId);

    const [password, setPassword] = useState("");
    const [errorPassword, setErrorPassword] = useState("");

    const [key, setKey] = useState("");
    const [locked, setLocked] = useState(true);

    const [busy, setBusy] = useState(false);

    useEffect(() => {
        setLocked(true);
    }, [walletAddress]);

    const submit = () => {
        if (busy) {
            return;
        }

        setBusy(true);

        Request.Do(ApiWallet.ExportPrivatekey(walletId, { password }))
            .onSuccess(res => {
                setBusy(false);
                setPassword("");
                setKey(res.private_key);
                setLocked(false);
                NavigationCallbacks.ShowSuccessMessage(navigation, t("Success"), t("Wallet key successfully exported!"));
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

    const copyPrivateKey = () => {
        Clipboard.setStringAsync(key)
            .then(() => {
                NavigationCallbacks.ShowSuccessMessage(navigation, t("Success"), t("Private key copied to clipboard"));
            })
            .catch(err => {
                console.error(err);
            });
    };

    const Styles = useThemedStyle(WalletSettingsScreensStyles);

    return (
        <WalletSettingsBase
            current="WalletExportKeyScreen"
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
                        <Text style={Styles.subTitle}>{t("Export wallet key")}</Text>
                    </View>

                    <AppFormInput value={walletAddress} label={t("Wallet address")} disabled />

                    {locked ? (
                        <View>
                            <AppFormInput
                                value={password}
                                setValue={v => {
                                    setErrorPassword("");
                                    setPassword(v);
                                }}
                                label={t("Wallet password")}
                                maxLength={255}
                                error={errorPassword}
                                isPassword
                                disabled={busy}
                            />

                            <View style={Styles.row}>
                                <AppButton paddingH={20} disabled={busy || !password} icon="key" title={t("Export key")} onPress={submit} />
                            </View>
                        </View>
                    ) : (
                        <View>
                            <AppFormInput value={key} label={t("Wallet private key")} disabled multiLine={3} />

                            <View style={Styles.row}>
                                <AppButton paddingH={20} icon="clone" title={t("Copy key to clipboard")} onPress={copyPrivateKey} />
                            </View>
                        </View>
                    )}

                    <View style={Styles.row} />
                </View>
            )}
        </WalletSettingsBase>
    );
}

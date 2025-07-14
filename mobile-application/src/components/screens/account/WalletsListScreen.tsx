// Component: WalletsListScreen

import { View, Text, ActivityIndicator } from "react-native";

import { useTranslation } from "../../../hooks/translation";
import { useThemedStyle } from "../../../style/themed-style";
import { NavigationProp } from "@react-navigation/native";
import AccountSettingsBase from "./AccountSettingsBase";
import AccountSettingsScreensStyles from "../../../style/screens/account-settings";
import { useAuth } from "../../../hooks/auth";
import { useEffect, useState } from "react";
import { getUniqueStringId } from "../../../utils/unique-id";
import { useTheme } from "../../../style/theme-context";
import { WalletInfo } from "../../../api/definitions";
import { Timeouts } from "../../../utils/timeout";
import { Request } from "@asanrom/request-browser";
import { ApiWallet } from "../../../api/api-group-wallet";
import { AppEvents } from "../../../control/app-events";
import AppButton from "../../utils/AppButton";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import * as Clipboard from "expo-clipboard";
import { NavigationCallbacks } from "../../../control/navigation-callbacks";

export default function WalletsListScreen({ navigation }: { navigation: NavigationProp<any> }) {
    const { t } = useTranslation();

    const [loadRequestId] = useState(getUniqueStringId());

    const { session } = useAuth();

    const { theme } = useTheme();

    const [loading, setLoading] = useState(true);

    const [wallets, setWallets] = useState<WalletInfo[]>([]);

    const load = () => {
        setLoading(true);

        Timeouts.Abort(loadRequestId);

        Request.Pending(loadRequestId, ApiWallet.ListWallets())
            .onSuccess(response => {
                setLoading(false);
                setWallets(response);
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

        AppEvents.AddEventListener("wallet-list-changed", load);

        return () => {
            AppEvents.RemoveEventListener("wallet-list-changed", load);
            Timeouts.Abort(loadRequestId);
            Request.Abort(loadRequestId);
        };
    }, [session]);

    const Styles = useThemedStyle(AccountSettingsScreensStyles);

    return (
        <AccountSettingsBase
            current="WalletsListScreen"
            navigation={navigation}
            refreshing={loading}
            onRefresh={() => {
                load();
            }}>
            {loading ? (
                <ActivityIndicator size="large" color={theme.activityIndicatorColor} />
            ) : (
                <View>
                    <View style={Styles.subTitleContainer}>
                        <Text style={Styles.subTitle}>{t("My wallets")}</Text>
                    </View>

                    {wallets.map(w => {
                        return (
                            <View key={w.id} style={Styles.walletContainer}>
                                <View style={Styles.walletContainerInner}>
                                    <View style={Styles.walletHeader}>
                                        <View style={Styles.walletIconContainer}>
                                            <FontAwesomeIcon icon="wallet" size={16} color={theme.text} />
                                        </View>
                                        <Text style={Styles.walletName}>{w.name}</Text>
                                    </View>
                                    <Text style={Styles.walletAddress}>{w.address}</Text>
                                    <View style={Styles.walletOptionsRow}>
                                        <AppButton
                                            size={14}
                                            paddingH={10}
                                            icon="clone"
                                            title={t("Copy address")}
                                            onPress={() => {
                                                Clipboard.setStringAsync(w.address)
                                                    .then(() => {
                                                        NavigationCallbacks.ShowSuccessMessage(
                                                            navigation,
                                                            t("Success"),
                                                            t("Address copied to clipboard"),
                                                        );
                                                    })
                                                    .catch(err => {
                                                        console.error(err);
                                                    });
                                            }}
                                        />
                                        <AppButton
                                            size={14}
                                            paddingH={10}
                                            icon="cog"
                                            title={t("Wallet settings")}
                                            onPress={() => {
                                                navigation.navigate("WalletSettingsMenu", { id: w.id, name: w.name });
                                            }}
                                        />
                                    </View>
                                </View>
                            </View>
                        );
                    })}

                    <View style={Styles.row}>
                        <AppButton
                            paddingH={20}
                            kind="primary"
                            icon="plus"
                            title={t("Create wallet")}
                            onPress={() => {
                                navigation.navigate("CreateWalletScreen");
                            }}
                        />
                    </View>
                    <View style={Styles.row} />
                </View>
            )}
        </AccountSettingsBase>
    );
}

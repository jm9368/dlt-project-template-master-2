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
import AppFormInput from "../../utils/AppFormInput";
import AppButton from "../../utils/AppButton";
import { Request } from "@asanrom/request-browser";
import { ApiWallet } from "../../../api/api-group-wallet";
import { NavigationCallbacks } from "../../../control/navigation-callbacks";
import { WalletsController } from "../../../control/wallets";
import { AppEvents } from "../../../control/app-events";

export default function WalletDeleteScreen({ navigation }: { navigation: NavigationProp<any> }) {
    const { t } = useTranslation();

    const { theme } = useTheme();

    const route = useRoute();

    const walletId = (route.params as any)["id"] || "";

    const { loading, load, notFound, walletName, walletAddress } = useWalletDetails(navigation, walletId);

    const [confirmation, setConfirmation] = useState("");

    const [busy, setBusy] = useState(false);

    const submit = () => {
        if (busy) {
            return;
        }

        setBusy(true);

        Request.Do(ApiWallet.DeleteWallet(walletId))
            .onSuccess(() => {
                setBusy(false);
                setConfirmation("");
                WalletsController.Load();

                navigation.navigate("WalletsListScreen");

                NavigationCallbacks.ShowSuccessMessage(navigation, t("Success"), t("Wallet deleted successfully!"));
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

    const askSubmit = () => {
        NavigationCallbacks.AskConfirmation(
            navigation,
            t("Delete wallet"),
            t("Are you sure you want to delete the wallet from your account?"),
            () => {
                submit();
            },
        );
    };

    const Styles = useThemedStyle(WalletSettingsScreensStyles);

    return (
        <WalletSettingsBase
            current="WalletDeleteScreen"
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
                        <Text style={Styles.subTitle}>{t("Delete wallet")}</Text>
                    </View>

                    <AppFormInput value={walletName} label={t("Wallet name")} disabled />

                    <AppFormInput value={walletAddress} label={t("Wallet address")} disabled />

                    <AppFormInput
                        value={confirmation}
                        setValue={v => {
                            setConfirmation(v);
                        }}
                        label={t("Input the wallet name to confirm this action")}
                        maxLength={80}
                        disabled={busy}
                    />

                    <View style={Styles.row}>
                        <AppButton
                            paddingH={20}
                            kind="danger"
                            disabled={busy || confirmation !== walletName}
                            icon="trash-alt"
                            title={t("Delete wallet")}
                            onPress={askSubmit}
                        />
                    </View>
                    <View style={Styles.row} />
                </View>
            )}
        </WalletSettingsBase>
    );
}

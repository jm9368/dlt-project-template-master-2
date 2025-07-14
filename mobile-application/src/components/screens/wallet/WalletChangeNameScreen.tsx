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
import { Request } from "@asanrom/request-browser";
import { ApiWallet } from "../../../api/api-group-wallet";
import { NavigationCallbacks } from "../../../control/navigation-callbacks";
import { WalletsController } from "../../../control/wallets";
import { AppEvents } from "../../../control/app-events";
import AppFormInput from "../../utils/AppFormInput";
import AppButton from "../../utils/AppButton";

export default function WalletChangeNameScreen({ navigation }: { navigation: NavigationProp<any> }) {
    const { t } = useTranslation();

    const { theme } = useTheme();

    const route = useRoute();

    const walletId = (route.params as any)["id"] || "";

    const { loading, load, notFound, walletName } = useWalletDetails(navigation, walletId);

    const [busy, setBusy] = useState(false);

    const [newName, setNewName] = useState("");
    const [errorName, setErrorName] = useState("");

    const submit = () => {
        if (busy) {
            return;
        }

        setBusy(true);

        Request.Do(ApiWallet.ModifyWallet(walletId, { name: newName }))
            .onSuccess(() => {
                setBusy(false);
                setNewName("");
                NavigationCallbacks.ShowSuccessMessage(navigation, t("Success"), t("Wallet successfully renamed"));
                WalletsController.Load();
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
                    badRequestInvalidName: () => {
                        setErrorName(t("Invalid name provided"));
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
            current="WalletChangeNameScreen"
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
                        <Text style={Styles.subTitle}>{t("Change wallet name")}</Text>
                    </View>

                    <AppFormInput value={walletName} label={t("Current wallet name")} disabled />

                    <AppFormInput
                        value={newName}
                        setValue={v => {
                            setErrorName("");
                            setNewName(v);
                        }}
                        label={t("New wallet name")}
                        maxLength={80}
                        error={errorName}
                        disabled={busy}
                    />

                    <View style={Styles.row}>
                        <AppButton
                            paddingH={20}
                            disabled={busy || !newName || newName === walletName}
                            icon="pencil"
                            title={t("Change username")}
                            onPress={submit}
                        />
                    </View>
                    <View style={Styles.row} />
                </View>
            )}
        </WalletSettingsBase>
    );
}

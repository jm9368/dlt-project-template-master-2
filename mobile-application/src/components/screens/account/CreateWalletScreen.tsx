// Component: CreateWalletScreen

import { View, Text } from "react-native";

import { useTranslation } from "../../../hooks/translation";
import { useThemedStyle } from "../../../style/themed-style";
import { NavigationProp } from "@react-navigation/native";
import AccountSettingsBase from "./AccountSettingsBase";
import AccountSettingsScreensStyles from "../../../style/screens/account-settings";
import { useState } from "react";
import { Request } from "@asanrom/request-browser";
import { ApiWallet } from "../../../api/api-group-wallet";
import { NavigationCallbacks } from "../../../control/navigation-callbacks";
import { WalletsController } from "../../../control/wallets";
import { AppEvents } from "../../../control/app-events";
import AppFormInput from "../../utils/AppFormInput";
import AppButton from "../../utils/AppButton";

export default function CreateWalletScreen({ navigation }: { navigation: NavigationProp<any> }) {
    const { t } = useTranslation();

    const [busy, setBusy] = useState(false);

    const [name, setName] = useState("");
    const [errorName, setErrorName] = useState("");

    const [newPassword, setNewPassword] = useState("");
    const [errorNewPassword, setErrorNewPassword] = useState("");

    const [newPassword2, setNewPassword2] = useState("");
    const [errorNewPassword2, setErrorNewPassword2] = useState("");

    const [privateKey, setPrivateKey] = useState("");
    const [errorPrivateKey, setErrorPrivateKey] = useState("");

    const submit = () => {
        if (busy) {
            return;
        }

        if (!name) {
            setErrorName(t("You must specify a wallet name"));
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

        Request.Do(ApiWallet.CreateWallet({ name, password: newPassword, private_key: privateKey }))
            .onSuccess(w => {
                setBusy(false);
                setName("");
                setNewPassword("");
                setNewPassword2("");
                setPrivateKey("");

                WalletsController.Load();
                WalletsController.SetDefaultWallet(w);

                navigation.navigate("WalletDetailsScreen", { id: w.id });

                NavigationCallbacks.ShowSuccessMessage(navigation, t("Success"), t("Wallet successfully created!"));
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
                    badRequestInvalidName: () => {
                        setErrorName(t("Invalid name provided"));
                    },
                    badRequestInvalidPrivateKey: () => {
                        setErrorPrivateKey(t("Invalid private key provided"));
                    },
                    badRequestTooManyWallets: () => {
                        NavigationCallbacks.ShowErrorMessage(
                            navigation,
                            t("Error"),
                            t("You already have too many wallets registered for your account. Please delete some before creating more."),
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
                NavigationCallbacks.ShowErrorMessage(navigation, t("Error"), err.message);
            });
    };

    const Styles = useThemedStyle(AccountSettingsScreensStyles);

    return (
        <AccountSettingsBase current="CreateWalletScreen" navigation={navigation}>
            <View>
                <View style={Styles.subTitleContainer}>
                    <Text style={Styles.subTitle}>{t("Create wallet")}</Text>
                </View>

                <AppFormInput
                    value={name}
                    setValue={v => {
                        setErrorName("");
                        setName(v);
                    }}
                    label={t("New wallet name")}
                    maxLength={80}
                    error={errorName}
                    disabled={busy}
                />

                <AppFormInput
                    value={newPassword}
                    setValue={v => {
                        setErrorNewPassword("");
                        setErrorNewPassword2("");
                        setNewPassword(v);
                    }}
                    label={t("Wallet password")}
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
                    label={t("Repeat the password")}
                    maxLength={255}
                    error={errorNewPassword2}
                    isPassword
                    disabled={busy}
                />

                <AppFormInput
                    value={privateKey}
                    setValue={v => {
                        setErrorPrivateKey("");
                        setPrivateKey(v);
                    }}
                    label={t("Private key (Hexadecimal. If you leave it blank, it will generate a random one)")}
                    maxLength={300}
                    error={errorPrivateKey}
                    disabled={busy}
                    multiLine={3}
                />

                <View style={Styles.row}>
                    <AppButton paddingH={20} disabled={busy} icon="plus" title={t("Create wallet")} onPress={submit} />
                </View>
                <View style={Styles.row} />
            </View>
        </AccountSettingsBase>
    );
}

// Component: WalletDetailsScreen

import { View, Text, ActivityIndicator } from "react-native";

import { useTranslation } from "../../../hooks/translation";
import { useThemedStyle } from "../../../style/themed-style";
import { NavigationProp, useRoute } from "@react-navigation/native";
import WalletSettingsBase from "./WalletSettingsBase";
import WalletSettingsScreensStyles from "../../../style/screens/wallet-settings";
import { useWalletDetails } from "../../../hooks/wallet-details";
import { useTheme } from "../../../style/theme-context";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import AppButton from "../../utils/AppButton";
import * as Clipboard from "expo-clipboard";
import { NavigationCallbacks } from "../../../control/navigation-callbacks";

export default function ChangePasswordScreen({ navigation }: { navigation: NavigationProp<any> }) {
    const { t } = useTranslation();

    const { theme } = useTheme();

    const route = useRoute();

    const walletId = (route.params as any)["id"] || "";

    const { loading, load, notFound, walletName, walletAddress } = useWalletDetails(navigation, walletId);

    const Styles = useThemedStyle(WalletSettingsScreensStyles);

    return (
        <WalletSettingsBase
            current="WalletDetailsScreen"
            navigation={navigation}
            refreshing={loading}
            onRefresh={() => {
                load();
            }}
            walletId={walletId}
            walletName={walletName}
            walletLoaded={!loading}>
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
                        <Text style={Styles.subTitle}>{t("Wallet details")}</Text>
                    </View>

                    <View style={Styles.walletContainer}>
                        <View style={Styles.walletContainerInner}>
                            <View style={Styles.walletHeader}>
                                <View style={Styles.walletIconContainer}>
                                    <FontAwesomeIcon icon="wallet" size={16} color={theme.text} />
                                </View>
                                <Text style={Styles.walletName}>{walletName}</Text>
                            </View>
                            <Text style={Styles.walletAddress}>{walletAddress}</Text>
                            <View style={Styles.walletOptionsRow}>
                                <AppButton
                                    size={14}
                                    paddingH={10}
                                    icon="clone"
                                    title={t("Copy address")}
                                    onPress={() => {
                                        Clipboard.setStringAsync(walletAddress)
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
                            </View>
                        </View>
                    </View>
                </View>
            )}
        </WalletSettingsBase>
    );
}

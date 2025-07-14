// Component: WalletSettingsMenu
// Menu to navigate inside the wallet settings

import { NavigationProp, useRoute } from "@react-navigation/native";
import { useTranslation } from "../../../hooks/translation";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useThemedStyle } from "../../../style/themed-style";
import ModalMenuSidebarStyles from "../../../style/modals/modal-main-menu";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { useTheme } from "../../../style/theme-context";
import PreferenceButton from "../../utils/PreferenceButton";

export default function AccountSettingsMenu({ navigation }: { navigation: NavigationProp<any> }) {
    const { t } = useTranslation();

    const Styles = useThemedStyle(ModalMenuSidebarStyles);

    const route = useRoute();

    const walletId = (route.params as any)["id"] || "";
    const walletName = (route.params as any)["name"] || "";

    const { theme } = useTheme();

    return (
        <ScrollView style={Styles.container}>
            <View style={Styles.containerInner}>
                <View style={Styles.header}>
                    <View style={Styles.headerInner}>
                        <View style={Styles.titleContainer}>
                            <Text style={Styles.title}>
                                {t("Wallet")}: {walletName}
                            </Text>
                        </View>
                        <View style={Styles.closeButtonContainer}>
                            <TouchableOpacity
                                style={Styles.closeButton}
                                onPress={() => {
                                    navigation.goBack();
                                }}>
                                <FontAwesomeIcon icon="times" size={26} color={theme.text} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
                <View style={Styles.optionsContainer}>
                    <View style={Styles.optionContainer}>
                        <PreferenceButton
                            icon="arrow-left"
                            name={t("Back to wallets list")}
                            arrow={false}
                            onPress={() => {
                                navigation.goBack();
                                navigation.navigate("WalletsListScreen");
                            }}
                        />
                    </View>

                    <View style={Styles.separator} />

                    <Text style={Styles.sectionTitle}>{t("Wallet")}</Text>

                    <View style={Styles.optionContainer}>
                        <PreferenceButton
                            icon="wallet"
                            name={t("Wallet details")}
                            arrow={false}
                            onPress={() => {
                                navigation.goBack();
                                navigation.navigate("WalletDetailsScreen", { id: walletId });
                            }}
                        />
                    </View>

                    <View style={Styles.optionContainer}>
                        <PreferenceButton
                            icon="pencil"
                            name={t("Change name")}
                            arrow={false}
                            onPress={() => {
                                navigation.goBack();
                                navigation.navigate("WalletChangeNameScreen", { id: walletId });
                            }}
                        />
                    </View>

                    <View style={Styles.separator} />

                    <Text style={Styles.sectionTitle}>{t("Security")}</Text>

                    <View style={Styles.optionContainer}>
                        <PreferenceButton
                            icon="key"
                            name={t("Change password")}
                            arrow={false}
                            onPress={() => {
                                navigation.goBack();
                                navigation.navigate("WalletChangePasswordScreen", { id: walletId });
                            }}
                        />
                    </View>

                    <View style={Styles.optionContainer}>
                        <PreferenceButton
                            icon="key"
                            name={t("Export key")}
                            arrow={false}
                            onPress={() => {
                                navigation.goBack();
                                navigation.navigate("WalletExportKeyScreen", { id: walletId });
                            }}
                        />
                    </View>

                    <View style={Styles.separator} />

                    <Text style={Styles.sectionTitle}>{t("Danger zone")}</Text>

                    <View style={Styles.optionContainer}>
                        <PreferenceButton
                            icon="trash-alt"
                            name={t("Delete wallet")}
                            arrow={false}
                            onPress={() => {
                                navigation.goBack();
                                navigation.navigate("WalletDeleteScreen", { id: walletId });
                            }}
                        />
                    </View>
                </View>
            </View>
        </ScrollView>
    );
}

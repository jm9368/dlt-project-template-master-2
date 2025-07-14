// Component: AccountSettingsMenu
// Menu to navigate inside the account settings

import { NavigationProp } from "@react-navigation/native";
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

    const { theme } = useTheme();

    return (
        <ScrollView style={Styles.container}>
            <View style={Styles.containerInner}>
                <View style={Styles.header}>
                    <View style={Styles.headerInner}>
                        <View style={Styles.titleContainer}>
                            <Text style={Styles.title}>{t("Account settings")}</Text>
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
                    <Text style={Styles.sectionTitle}>{t("Account")}</Text>

                    <View style={Styles.optionContainer}>
                        <PreferenceButton
                            icon="user"
                            name={t("Edit profile")}
                            arrow={false}
                            onPress={() => {
                                navigation.goBack();
                                navigation.navigate("EditProfileScreen");
                            }}
                        />
                    </View>

                    <View style={Styles.optionContainer}>
                        <PreferenceButton
                            icon="user-tag"
                            name={t("Change username")}
                            arrow={false}
                            onPress={() => {
                                navigation.goBack();
                                navigation.navigate("ChangeUsernameScreen");
                            }}
                        />
                    </View>

                    <View style={Styles.optionContainer}>
                        <PreferenceButton
                            icon="language"
                            name={t("Select language")}
                            arrow={false}
                            onPress={() => {
                                navigation.goBack();
                                navigation.navigate("SelectLanguageScreen");
                            }}
                        />
                    </View>

                    <View style={Styles.separator} />

                    <Text style={Styles.sectionTitle}>{t("Security")}</Text>

                    <View style={Styles.optionContainer}>
                        <PreferenceButton
                            icon="envelope"
                            name={t("Change email")}
                            arrow={false}
                            onPress={() => {
                                navigation.goBack();
                                navigation.navigate("ChangeEmailScreen");
                            }}
                        />
                    </View>

                    <View style={Styles.optionContainer}>
                        <PreferenceButton
                            icon="key"
                            name={t("Change password")}
                            arrow={false}
                            onPress={() => {
                                navigation.goBack();
                                navigation.navigate("ChangePasswordScreen");
                            }}
                        />
                    </View>

                    <View style={Styles.optionContainer}>
                        <PreferenceButton
                            icon="user-lock"
                            name={t("Two factor authentication")}
                            arrow={false}
                            onPress={() => {
                                navigation.goBack();
                                navigation.navigate("TwoFactorAuthenticationScreen");
                            }}
                        />
                    </View>

                    <View style={Styles.optionContainer}>
                        <PreferenceButton
                            icon="desktop"
                            name={t("Active sessions")}
                            arrow={false}
                            onPress={() => {
                                navigation.goBack();
                                navigation.navigate("ActiveSessionsScreen");
                            }}
                        />
                    </View>

                    <View style={Styles.separator} />

                    <Text style={Styles.sectionTitle}>{t("Wallets")}</Text>

                    <View style={Styles.optionContainer}>
                        <PreferenceButton
                            icon="wallet"
                            name={t("My wallets")}
                            arrow={false}
                            onPress={() => {
                                navigation.goBack();
                                navigation.navigate("WalletsListScreen");
                            }}
                        />
                    </View>

                    <View style={Styles.optionContainer}>
                        <PreferenceButton
                            icon="plus"
                            name={t("Create wallet")}
                            arrow={false}
                            onPress={() => {
                                navigation.goBack();
                                navigation.navigate("CreateWalletScreen");
                            }}
                        />
                    </View>

                    <View style={Styles.separator} />

                    <Text style={Styles.sectionTitle}>{t("Danger zone")}</Text>

                    <View style={Styles.optionContainer}>
                        <PreferenceButton
                            icon="trash-alt"
                            name={t("Delete account")}
                            arrow={false}
                            onPress={() => {
                                navigation.goBack();
                                navigation.navigate("DeleteAccountScreen");
                            }}
                        />
                    </View>
                </View>
            </View>
        </ScrollView>
    );
}

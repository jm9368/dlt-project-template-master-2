// Component: UserSettingsModal
// Displays a modal to change user settings. This is mainly a menu.

import { View, Text, TouchableOpacity, ScrollView, Image } from "react-native";
import { useThemedStyle } from "../../../../style/themed-style";
import { useTranslation } from "../../../../hooks/translation";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { useTheme } from "../../../../style/theme-context";
import ModalUserSettingsStyles from "../../../../style/modals/modal-user-settings";
import { AuthController } from "../../../../control/auth";
import DarkTheme from "../../../../style/dark";
import PreferenceButton from "../../../utils/PreferenceButton";
import { renderLanguage } from "../../../../utils/languages";
import { NavigationCallbacks } from "../../../../control/navigation-callbacks";
import { NavigationProp } from "@react-navigation/native";
import { useAuth } from "../../../../hooks/auth";
import AppImage from "../../../utils/AppImage";
import { useCurrentWallet } from "../../../../hooks/wallet-current";
import * as Clipboard from "expo-clipboard";

export default function UserSettingsModal({ navigation }: { navigation: NavigationProp<any> }) {
    const { t, language } = useTranslation();

    const Styles = useThemedStyle(ModalUserSettingsStyles);

    const { theme } = useTheme();

    const renderTheme = (currentTheme: string) => {
        if (currentTheme === DarkTheme.id) {
            return t("Dark");
        } else {
            return t("Light");
        }
    };

    const { username, profileName, profileImage } = useAuth();

    const getImage = () => {
        if (profileImage) {
            return <AppImage style={Styles.profileImage} src={profileImage} />;
        } else {
            return <Image style={Styles.profileImage} source={require("../../../../../assets/user.png")} />;
        }
    };

    const { wallets, currentWalletId, currentWalletName, currentWalletAddress } = useCurrentWallet();

    return (
        <View style={Styles.container}>
            <View style={Styles.containerInner}>
                <View style={Styles.header}>
                    <View style={Styles.headerInner}>
                        <View style={Styles.profileImageContainer}>{getImage()}</View>
                        <View style={Styles.profileNameContainer}>
                            <Text style={Styles.profileName}>{profileName || username}</Text>
                            <Text style={Styles.username}>{username}</Text>
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
                <ScrollView style={Styles.optionsContainer}>
                    <View style={Styles.optionContainer}>
                        <PreferenceButton
                            icon="user"
                            name={t("My profile")}
                            arrow={false}
                            onPress={() => {
                                navigation.goBack();
                                navigation.navigate("ProfileScreen", { q: "@" + username });
                            }}
                        />
                    </View>

                    <View style={Styles.separator} />

                    <View style={Styles.optionContainer}>
                        <PreferenceButton
                            icon="language"
                            name={t("Language")}
                            value={renderLanguage(language)}
                            arrow
                            onPress={() => navigation.navigate("LanguageSelectModal")}
                        />
                    </View>
                    <View style={Styles.optionContainer}>
                        <PreferenceButton
                            icon="moon"
                            name={t("Theme")}
                            value={renderTheme(theme.id)}
                            arrow
                            onPress={() => navigation.navigate("ThemeSelectModal")}
                        />
                    </View>

                    <View style={Styles.separator} />

                    <View style={Styles.optionContainer}>
                        <PreferenceButton
                            icon="cog"
                            name={t("Account settings")}
                            arrow={false}
                            onPress={() => {
                                navigation.goBack();
                                navigation.navigate("AccountSettingsMenu");
                            }}
                        />
                    </View>

                    <View style={Styles.separator} />

                    {wallets.length > 0 ? (
                        <View style={Styles.optionContainer}>
                            <PreferenceButton
                                icon="wallet"
                                name={t("Wallet")}
                                value={currentWalletName}
                                arrow
                                onPress={() => {
                                    navigation.navigate("WalletSelectModal");
                                }}
                            />
                        </View>
                    ) : (
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
                    )}

                    {!!currentWalletAddress && (
                        <View style={Styles.optionContainer}>
                            <PreferenceButton
                                icon="clone"
                                name={t("Copy wallet address")}
                                arrow={false}
                                onPress={() => {
                                    Clipboard.setStringAsync(currentWalletAddress)
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
                    )}

                    {!!currentWalletId && (
                        <View style={Styles.optionContainer}>
                            <PreferenceButton
                                icon="cog"
                                name={t("Manage wallet")}
                                arrow={false}
                                onPress={() => {
                                    navigation.goBack();
                                    navigation.navigate("WalletDetailsScreen", { id: currentWalletId });
                                }}
                            />
                        </View>
                    )}

                    <View style={Styles.separator} />

                    <View style={Styles.optionContainer}>
                        <PreferenceButton
                            icon="sign-out-alt"
                            name={t("Log out")}
                            arrow={false}
                            onPress={() => {
                                NavigationCallbacks.AskConfirmation(navigation, t("Log out"), t("Do you want to log out?"), () => {
                                    AuthController.Logout();
                                    navigation.goBack();
                                    navigation.navigate("LoginScreen");
                                });
                            }}
                        />
                    </View>

                    <View style={Styles.optionContainer} />
                </ScrollView>
            </View>
        </View>
    );
}

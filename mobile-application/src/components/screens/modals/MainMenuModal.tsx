// Component: MainMenuModal
// Displays a modal with options like home, about, etc.

import { NavigationProp } from "@react-navigation/native";
import { useTranslation } from "../../../hooks/translation";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useThemedStyle } from "../../../style/themed-style";
import ModalMenuSidebarStyles from "../../../style/modals/modal-main-menu";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { useTheme } from "../../../style/theme-context";
import PreferenceButton from "../../utils/PreferenceButton";
import Constants from "expo-constants";

export default function MainMenuModal({ navigation }: { navigation: NavigationProp<any> }) {
    const { t } = useTranslation();

    const Styles = useThemedStyle(ModalMenuSidebarStyles);

    const { theme } = useTheme();

    return (
        <View style={Styles.container}>
            <View style={Styles.containerInner}>
                <View style={Styles.header}>
                    <View style={Styles.headerInner}>
                        <View style={Styles.titleContainer}>
                            <Text style={Styles.title}>{Constants.expoConfig.extra.platform_name || "Platform"}</Text>
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
                            icon="home"
                            name={t("Home")}
                            arrow={false}
                            onPress={() => {
                                navigation.goBack();
                                navigation.navigate("HomeScreen");
                            }}
                        />
                    </View>

                    <View style={Styles.optionContainer}>
                        <PreferenceButton
                            icon="info"
                            name={t("About")}
                            arrow={false}
                            onPress={() => {
                                navigation.goBack();
                                navigation.navigate("AboutScreen");
                            }}
                        />
                    </View>
                </ScrollView>
            </View>
        </View>
    );
}

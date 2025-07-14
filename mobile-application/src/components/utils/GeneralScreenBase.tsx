// Component: GeneralScreenBase
// Serves as a base for any screens

import { TouchableOpacity, View, Text, Image, RefreshControl, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import GeneralScreenBaseStyles from "../../style/utils/general-base";
import { useThemedStyle } from "../../style/themed-style";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { useTheme } from "../../style/theme-context";
import { useTranslation } from "../../hooks/translation";
import { useAuth } from "../../hooks/auth";
import AppImage from "./AppImage";
import { NavigationProp } from "@react-navigation/native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

interface Props {
    /**
     * Children elements
     */
    children: any;

    /**
     * Current view name
     */
    current?: string;

    /**
     * Navigation context
     */
    navigation: NavigationProp<any>;

    /**
     * Refreshing?
     */
    refreshing?: boolean;

    /**
     * Callback to refresh
     */
    onRefresh?: () => void;

    /**
     * True if busy
     */
    busy?: boolean;

    /**
     * Description for busy indicator
     */
    busyMessage?: string;
}

export default function GeneralScreenBase({ children, navigation, refreshing, onRefresh, busy, busyMessage }: Props) {
    const { t } = useTranslation();

    const { theme } = useTheme();

    const Styles = useThemedStyle(GeneralScreenBaseStyles);

    const { username, profileName, profileImage } = useAuth();

    const getImage = () => {
        if (profileImage) {
            return <AppImage style={Styles.headerImage} src={profileImage} />;
        } else {
            return <Image style={Styles.headerImage} source={require("../../../assets/user.png")} />;
        }
    };

    return (
        <KeyboardAvoidingView
            enabled={Platform.OS !== "ios"}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={Styles.container}>
            <KeyboardAwareScrollView
                nestedScrollEnabled
                alwaysBounceVertical={false}
                style={Styles.scrollContainer}
                contentContainerStyle={Styles.scrollContent}>
                <View style={Styles.header}>
                    <TouchableOpacity
                        style={Styles.headerImageContainer}
                        onPress={() => {
                            navigation.navigate("UserSettingsModal");
                        }}>
                        {getImage()}
                    </TouchableOpacity>
                    <View style={Styles.headerTextContainer}>
                        <Text style={Styles.headerText}>{t("Hello, $USER!").replace("$USER", profileName || username)}</Text>
                    </View>
                    <View style={Styles.headerButtonContainer}>
                        <TouchableOpacity
                            style={Styles.headerButton}
                            onPress={() => {
                                navigation.navigate("MainMenuModal");
                            }}>
                            <FontAwesomeIcon icon="bars" size={26} color={theme.text} />
                        </TouchableOpacity>
                    </View>
                </View>

                <KeyboardAwareScrollView
                    style={Styles.body}
                    refreshControl={onRefresh && <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
                    {children}
                </KeyboardAwareScrollView>

                {busy && (
                    <View style={Styles.busyContainer}>
                        <ActivityIndicator size="large" color={theme.activityIndicatorColor} />
                        {busyMessage && <Text style={Styles.busyMessage}>{busyMessage}</Text>}
                    </View>
                )}
            </KeyboardAwareScrollView>
        </KeyboardAvoidingView>
    );
}

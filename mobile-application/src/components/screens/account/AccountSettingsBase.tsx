// Component: AccountSettingsBase
// Base for all account settings screens

import { View, Text, TouchableOpacity } from "react-native";

import { useTranslation } from "../../../hooks/translation";
import { useThemedStyle } from "../../../style/themed-style";
import GeneralScreenBase from "../../utils/GeneralScreenBase";
import { NavigationProp } from "@react-navigation/native";
import AccountSettingsScreensStyles from "../../../style/screens/account-settings";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { useTheme } from "../../../style/theme-context";

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

export default function AccountSettingsBase({ navigation, current, children, refreshing, onRefresh, busy, busyMessage }: Props) {
    const { t } = useTranslation();

    const { theme } = useTheme();

    const Styles = useThemedStyle(AccountSettingsScreensStyles);

    return (
        <GeneralScreenBase
            current={current}
            navigation={navigation}
            refreshing={refreshing}
            onRefresh={onRefresh}
            busy={busy}
            busyMessage={busyMessage}>
            <View>
                <View style={Styles.titleContainer}>
                    <Text style={Styles.title}>{t("Account settings")}</Text>
                    <TouchableOpacity
                        style={Styles.titleMenuButton}
                        onPress={() => {
                            navigation.navigate("AccountSettingsMenu");
                        }}>
                        <FontAwesomeIcon icon="bars" size={16} color={theme.links} />
                    </TouchableOpacity>
                </View>
                {children}
            </View>
        </GeneralScreenBase>
    );
}

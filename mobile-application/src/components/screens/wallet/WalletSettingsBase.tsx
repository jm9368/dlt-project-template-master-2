// Component: WalletSettingsBase
// Base for all wallet settings screens

import { View, Text, TouchableOpacity } from "react-native";

import { useTranslation } from "../../../hooks/translation";
import { useThemedStyle } from "../../../style/themed-style";
import GeneralScreenBase from "../../utils/GeneralScreenBase";
import { NavigationProp } from "@react-navigation/native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { useTheme } from "../../../style/theme-context";
import WalletSettingsScreensStyles from "../../../style/screens/wallet-settings";

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

    /**
     * True if wallet is loaded
     */
    walletLoaded: boolean;

    /**
     * Wallet ID
     */
    walletId: string;

    /**
     * Wallet name
     */
    walletName?: string;
}

export default function WalletSettingsBase({
    navigation,
    current,
    children,
    refreshing,
    onRefresh,
    busy,
    busyMessage,
    walletLoaded,
    walletId,
    walletName,
}: Props) {
    const { t } = useTranslation();

    const { theme } = useTheme();

    const Styles = useThemedStyle(WalletSettingsScreensStyles);

    return (
        <GeneralScreenBase
            current={current}
            navigation={navigation}
            refreshing={refreshing}
            onRefresh={onRefresh}
            busy={busy}
            busyMessage={busyMessage}>
            <View>
                {walletLoaded && (
                    <View style={Styles.titleContainer}>
                        <Text style={Styles.title}>
                            {t("Wallet")}: {walletName}
                        </Text>
                        <TouchableOpacity
                            style={Styles.titleMenuButton}
                            onPress={() => {
                                navigation.navigate("WalletSettingsMenu", { id: walletId, name: walletName });
                            }}>
                            <FontAwesomeIcon icon="bars" size={16} color={theme.links} />
                        </TouchableOpacity>
                    </View>
                )}
                {children}
            </View>
        </GeneralScreenBase>
    );
}

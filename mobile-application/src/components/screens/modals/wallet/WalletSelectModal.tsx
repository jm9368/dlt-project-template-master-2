// Component: WalletSelectModal
// Displays a modal to select the current wallet

import { View, Text, TouchableOpacity } from "react-native";
import { useThemedStyle } from "../../../../style/themed-style";
import ModalPreferenceSelectStyles from "../../../../style/modals/modal-preference-select";
import { useTranslation } from "../../../../hooks/translation";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { useTheme } from "../../../../style/theme-context";
import ModalContainer from "../ModalContainer";
import { NavigationProp } from "@react-navigation/native";
import { useCurrentWallet } from "../../../../hooks/wallet-current";
import { WalletsController } from "../../../../control/wallets";

export default function WalletSelectModal({ navigation }: { navigation: NavigationProp<any> }) {
    const { t } = useTranslation();

    const { theme } = useTheme();

    const { wallets, currentWalletId } = useCurrentWallet();

    const Styles = useThemedStyle(ModalPreferenceSelectStyles);

    const getButtons = () => {
        return wallets.map(w => {
            const checkIcon = w.id === currentWalletId ? <FontAwesomeIcon icon="check" size={16} color={theme.text} /> : null;

            return (
                <View key={w.id} style={Styles.optionContainer}>
                    <TouchableOpacity
                        style={Styles.optionContainerTouchable}
                        onPress={() => {
                            WalletsController.SetDefaultWallet(w);
                            navigation.goBack();
                        }}>
                        <View style={Styles.optionIconContainer}>{checkIcon}</View>
                        <View style={Styles.optionNameContainer}>
                            <Text style={Styles.optionNameText}>{w.name}</Text>
                            <Text style={Styles.optionDetailText}>
                                {w.address.substring(0, 8) + "..." + w.address.substring(w.address.length - 8)}
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>
            );
        });
    };

    return (
        <ModalContainer
            title={t("Select a wallet")}
            onClose={() => {
                navigation.goBack();
            }}>
            {getButtons()}
        </ModalContainer>
    );
}

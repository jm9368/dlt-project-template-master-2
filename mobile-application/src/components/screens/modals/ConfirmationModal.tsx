// Component: ConfirmationModal
// Displays a confirmation modal

import { View, Text, TouchableOpacity } from "react-native";
import { useThemedStyle } from "../../../style/themed-style";
import { useTheme } from "../../../style/theme-context";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { NavigationProp, useRoute } from "@react-navigation/native";
import ModalConfirmationStyles from "../../../style/modals/modal-confirmation";
import AppButton from "../../utils/AppButton";
import { NavigationCallbacks } from "../../../control/navigation-callbacks";
import { useTranslation } from "../../../hooks/translation";

export default function ConfirmationModal({ navigation }: { navigation: NavigationProp<any> }) {
    const { t } = useTranslation();

    const { theme } = useTheme();

    const Styles = useThemedStyle(ModalConfirmationStyles);

    const route = useRoute();

    const title = (route.params as any)["title"] || "";
    const msg = (route.params as any)["msg"] || "";

    const danger = (route.params as any)["danger"] === "true";

    return (
        <View style={Styles.container}>
            <View style={Styles.containerInner}>
                <View style={Styles.header}>
                    <View style={Styles.headerInner}>
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
                <View style={Styles.bodyContainer}>
                    <View style={Styles.titleContainer}>
                        <Text style={Styles.title}>{title}</Text>
                    </View>
                    <View style={Styles.messageContainer}>
                        <Text style={Styles.message}>{msg}</Text>
                    </View>
                    <View style={Styles.buttonsContainer}>
                        <View style={Styles.buttonContainer}>
                            <AppButton
                                title={t("No")}
                                fullSize
                                onPress={() => {
                                    navigation.goBack();
                                }}
                                kind="secondary"
                                paddingH={20}
                            />
                        </View>
                        <View style={Styles.buttonContainer}>
                            <AppButton
                                title={t("Yes")}
                                fullSize
                                onPress={() => {
                                    navigation.goBack();
                                    if (NavigationCallbacks.ConfirmationCallback) {
                                        NavigationCallbacks.ConfirmationCallback();
                                        NavigationCallbacks.ConfirmationCallback = null;
                                    }
                                }}
                                kind={danger ? "danger" : "primary"}
                                paddingH={20}
                            />
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );
}

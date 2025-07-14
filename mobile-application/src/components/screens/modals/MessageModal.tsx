// Component: CurrencySelectModal
// Displays a modal to select the preferred currency of the user

import { View, Text, TouchableOpacity } from "react-native";
import { useThemedStyle } from "../../../style/themed-style";
import { useTheme } from "../../../style/theme-context";
import ModalMessageStyles from "../../../style/modals/modal-message";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { NavigationProp, useRoute } from "@react-navigation/native";

export default function MessageModal({ navigation }: { navigation: NavigationProp<any> }) {
    const { theme } = useTheme();

    const Styles = useThemedStyle(ModalMessageStyles);

    const route = useRoute();

    const kind = (route.params as any)["kind"] || "success";

    const title = (route.params as any)["title"] || "";
    const msg = (route.params as any)["msg"] || "";

    const backScreen = (route.params as any)["back"] || "";

    const getIcon = () => {
        if (kind === "error") {
            return (
                <View style={[Styles.icon, Styles.iconError]}>
                    <FontAwesomeIcon icon="times" size={48} color="#fff" />
                </View>
            );
        } else {
            return (
                <View style={[Styles.icon, Styles.iconSuccess]}>
                    <FontAwesomeIcon icon="check" size={48} color="#fff" />
                </View>
            );
        }
    };

    return (
        <View style={Styles.container}>
            <View style={Styles.containerInner}>
                <View style={Styles.header}>
                    <View style={Styles.headerInner}>
                        <View style={Styles.closeButtonContainer}>
                            <TouchableOpacity
                                style={Styles.closeButton}
                                onPress={() => {
                                    if (backScreen) {
                                        navigation.navigate(backScreen);
                                    } else {
                                        navigation.goBack();
                                    }
                                }}>
                                <FontAwesomeIcon icon="times" size={26} color={theme.text} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
                <View style={Styles.bodyContainer}>
                    <View style={Styles.iconContainer}>{getIcon()}</View>
                    <View style={Styles.titleContainer}>
                        <Text style={Styles.title}>{title}</Text>
                    </View>
                    <View style={Styles.messageContainer}>
                        <Text style={Styles.message}>{msg}</Text>
                    </View>
                </View>
            </View>
        </View>
    );
}

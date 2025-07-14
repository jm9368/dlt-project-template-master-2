// Component ModalContainer
// Acts as a base for any modals

import { ScrollView, View, Text, TouchableOpacity } from "react-native";
import { useThemedStyle } from "../../../style/themed-style";
import ModalPreferenceSelectStyles from "../../../style/modals/modal-preference-select";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { useTheme } from "../../../style/theme-context";

export default function ModalContainer({
    title,
    additionalText,
    children,
    onClose,
}: {
    title: string;
    additionalText?: string;
    onClose?: () => void;
    children?: any;
}) {
    const { theme } = useTheme();

    const Styles = useThemedStyle(ModalPreferenceSelectStyles);

    return (
        <ScrollView style={Styles.container}>
            <View style={Styles.containerInner}>
                <View style={Styles.header}>
                    <View style={Styles.headerInner}>
                        <View style={Styles.titleContainer}>
                            <Text style={Styles.title}>{title + (additionalText ? ": " + additionalText : "")}</Text>
                        </View>
                        <View style={Styles.closeButtonContainer}>
                            <TouchableOpacity style={Styles.closeButton} onPress={onClose}>
                                <FontAwesomeIcon icon="times" size={26} color={theme.text} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
                <View style={Styles.optionsContainer}>{children}</View>
            </View>
        </ScrollView>
    );
}

// Component: OptionSelectModal
// Displays a modal to select an option

import { View, Text, TouchableOpacity } from "react-native";
import { useThemedStyle } from "../../../style/themed-style";
import ModalPreferenceSelectStyles from "../../../style/modals/modal-preference-select";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { useTheme } from "../../../style/theme-context";
import ModalContainer from "./ModalContainer";
import { NavigationProp, useRoute } from "@react-navigation/native";
import { NavigationCallbacks, SelectableOption } from "../../../control/navigation-callbacks";
import { useState } from "react";

export default function LanguageSelectModal({ navigation }: { navigation: NavigationProp<any> }) {
    const { theme } = useTheme();

    const route = useRoute();

    const selectOptions: SelectableOption[] = (route.params as any).selectOptions;
    const title = (route.params as any).title || "";
    const [current, setCurrent] = useState((route.params as any).current || "");

    const Styles = useThemedStyle(ModalPreferenceSelectStyles);

    const selectOption = (opt: string) => {
        setCurrent(opt);
        navigation.goBack();
        if (NavigationCallbacks.OptionSelectCallback) {
            NavigationCallbacks.OptionSelectCallback(opt);
        }
    };

    const getButtons = () => {
        return selectOptions.map(opt => {
            const checkIcon = opt.id === current ? <FontAwesomeIcon icon="check" size={16} color={theme.text} /> : null;

            return (
                <View key={opt.id} style={Styles.optionContainer}>
                    <TouchableOpacity
                        style={Styles.optionContainerTouchable}
                        onPress={() => {
                            selectOption(opt.id);
                        }}>
                        <View style={Styles.optionIconContainer}>{checkIcon}</View>
                        <View style={Styles.optionNameContainer}>
                            <Text style={Styles.optionNameText}>{opt.name}</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            );
        });
    };

    return (
        <ModalContainer
            title={title}
            onClose={() => {
                navigation.goBack();
            }}>
            {getButtons()}
        </ModalContainer>
    );
}

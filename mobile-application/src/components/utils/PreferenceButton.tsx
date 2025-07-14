// Component: PreferenceButton
// Preference button, to use in menu modals

import { TouchableOpacity, Text, View } from "react-native";
import { useThemedStyle } from "../../style/themed-style";
import PreferenceButtonStyles from "../../style/utils/preference-button";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { useTheme } from "../../style/theme-context";

export interface PreferenceButtonProps {
    /**
     * Callback to call when the button is pressed
     */
    onPress?: () => void;

    /**
     * The icon to display
     */
    icon: any;

    /**
     * The name of the option
     */
    name: string;

    /**
     * Current value of the option (Optional)
     */
    value?: string;

    /**
     * Set to true to display an arrow at the right
     */
    arrow?: boolean;
}

const PreferenceButton = ({ onPress, icon, name, value, arrow }: PreferenceButtonProps) => {
    const Styles = useThemedStyle(PreferenceButtonStyles);

    const { theme } = useTheme();

    const getArrowIcon = () => {
        if (arrow) {
            return <FontAwesomeIcon icon="chevron-right" size={22} color={theme.text} />;
        } else {
            return null;
        }
    };

    const getValueElement = () => {
        if (value) {
            return (
                <View style={Styles.valueContainer}>
                    <Text style={Styles.value}>{value}</Text>
                </View>
            );
        } else {
            return null;
        }
    };

    return (
        <TouchableOpacity onPress={onPress} style={Styles.container}>
            <View style={Styles.iconContainer}>
                <FontAwesomeIcon icon={icon} size={26} color={theme.text} />
            </View>

            <Text style={[Styles.name, !value && Styles.nameNoValue, !!value && Styles.nameHalf]}>
                {name}
                {value ? ": " : ""}
            </Text>
            {getValueElement()}
            {getArrowIcon()}
        </TouchableOpacity>
    );
};

export default PreferenceButton;

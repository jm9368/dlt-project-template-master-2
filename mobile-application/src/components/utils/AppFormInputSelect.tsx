// Component: AppFormInputSelect
// App custom form input with a select menu

import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { useThemedStyle } from "../../style/themed-style";
import AppFormInputStyles from "../../style/utils/form-input";
import TouchableLink from "./TouchableLink";
import { useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { useTheme } from "../../style/theme-context";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { NavigationCallbacks, SelectableOption } from "../../control/navigation-callbacks";
import { NavigationProp } from "@react-navigation/native";

export interface AppFormInputSelectProps {
    /**
     * The label
     */
    label: string;

    /**
     * Navigation
     */
    navigation: NavigationProp<any>;

    /**
     * Available options
     */
    options: SelectableOption[];

    /**
     * The value
     */
    value: string;

    /**
     * Callback to set the value
     */
    setValue?: (v: string) => void;

    /**
     * Placeholder text, displayed when its empty
     */
    placeholder?: string;

    /**
     * Set it to add a link next to the label
     */
    rightLinkText?: string;

    /**
     * If rightLinkText is set, callback to be called when the link next to the label is pressed
     */
    rightLinkOnPress?: () => void;

    /**
     * Adds an icon at the left
     */
    icon?: IconProp;

    /**
     * Display an error, indicating the value is incorrect
     */
    error?: string;

    /**
     * True if the text input is disabled
     */
    disabled?: boolean;
}

const AppFormInputSelect = ({
    label,
    options,
    value,
    setValue,
    placeholder,
    rightLinkText,
    rightLinkOnPress,
    icon,
    error,
    disabled,
    navigation,
}: AppFormInputSelectProps) => {
    const Styles = useThemedStyle(AppFormInputStyles);

    const input_ref: any = useRef();
    const { theme } = useTheme();

    const getRightLink = function () {
        if (rightLinkText) {
            return (
                <TouchableLink onPress={rightLinkOnPress} small>
                    {rightLinkText}
                </TouchableLink>
            );
        } else {
            return null;
        }
    };

    const getSelectButton = () => {
        return (
            <TouchableOpacity
                disabled={disabled}
                onPress={e => {
                    e.stopPropagation();
                    NavigationCallbacks.ChooseAnOption(navigation, label, options, value, newVal => {
                        setValue && setValue(newVal);
                    });
                }}>
                <FontAwesomeIcon icon="chevron-down" size={22} color={theme.text} />
            </TouchableOpacity>
        );
    };

    const getInputIcon = () => {
        if (icon) {
            return <FontAwesomeIcon icon={icon} size={22} color={theme.text} />;
        } else {
            return null;
        }
    };

    const getError = () => {
        if (error) {
            return (
                <View style={Styles.errorContainer}>
                    <Text style={Styles.error}>{error}</Text>
                </View>
            );
        } else {
            return null;
        }
    };

    const renderValue = (value: string, options: SelectableOption[]) => {
        for (const opt of options) {
            if (opt.id === value) {
                return opt.name;
            }
        }

        return value;
    };

    return (
        <View style={Styles.container}>
            <View style={Styles.labelContainer}>
                <Text style={Styles.label}>{label}</Text>
                {getRightLink()}
            </View>
            <View
                onTouchStart={() => {
                    if (disabled) {
                        return;
                    }
                    NavigationCallbacks.ChooseAnOption(navigation, label, options, value, newVal => {
                        setValue && setValue(newVal);
                    });
                }}
                style={[Styles.inputContainer, error && Styles.inputError]}>
                {getInputIcon()}
                <TextInput
                    ref={input_ref}
                    editable={false}
                    style={[Styles.input]}
                    value={renderValue(value, options)}
                    placeholder={placeholder}
                    placeholderTextColor={theme.inputPlaceholderColor}
                />
                {getSelectButton()}
            </View>
            {getError()}
        </View>
    );
};

export default AppFormInputSelect;

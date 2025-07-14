// Component: AppFormInput
// App custom form input

import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { useThemedStyle } from "../../style/themed-style";
import AppFormInputStyles from "../../style/utils/form-input";
import TouchableLink from "./TouchableLink";
import { useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { useTheme } from "../../style/theme-context";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import DarkTheme from "../../style/dark";
import { renderDate, renderDateAndTime } from "../../utils/time-utils";
import { useTranslation } from "../../hooks/translation";

export interface AppFormInputProps {
    /**
     * The label
     */
    label: string;

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
     * True if it's a password input
     */
    isPassword?: boolean;

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
     * Max length of the text
     */
    maxLength?: number;

    /**
     * Display an error, indicating the value is incorrect
     */
    error?: string;

    /**
     * True if the text input is disabled
     */
    disabled?: boolean;

    /**
     * Set to use a date picker
     */
    isDate?: "date" | "datetime";

    /**
     * Multi line input?
     */
    multiLine?: number;
}

const AppFormInput = ({
    label,
    value,
    setValue,
    placeholder,
    isPassword,
    rightLinkText,
    rightLinkOnPress,
    icon,
    maxLength,
    error,
    disabled,
    isDate,
    multiLine,
}: AppFormInputProps) => {
    const Styles = useThemedStyle(AppFormInputStyles);

    const input_ref: any = useRef();

    const [hidePassword, setHidePassword] = useState(true);

    const [datePickerOpen, setDatePickerOpen] = useState(false);

    const [datePickerDate, setDatePickerDate] = useState(new Date());

    const { theme } = useTheme();

    const { t } = useTranslation();

    const getDate = (t: string) => {
        if (t) {
            try {
                const d = new Date(t);
                d.toISOString();
                return d;
            } catch (ex) {
                return new Date();
            }
        } else {
            return new Date();
        }
    };

    const getDateText = (d: Date | string, mode: "date" | "datetime") => {
        if (mode === "datetime") {
            return renderDateAndTime(d, t);
        } else {
            return renderDate(d, t);
        }
    };

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

    const getPasswordHideButton = () => {
        if (!isPassword) {
            return null;
        }

        if (hidePassword) {
            return (
                <TouchableOpacity
                    disabled={disabled}
                    onPress={e => {
                        e.stopPropagation();
                        setHidePassword(false);
                    }}>
                    <FontAwesomeIcon icon="eye-slash" size={22} color={theme.text} />
                </TouchableOpacity>
            );
        } else {
            return (
                <TouchableOpacity
                    disabled={disabled}
                    onPress={e => {
                        e.stopPropagation();
                        setHidePassword(true);
                    }}>
                    <FontAwesomeIcon icon="eye" size={22} color={theme.text} />
                </TouchableOpacity>
            );
        }
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
                    if (isDate) {
                        setDatePickerDate(getDate(value));
                        setDatePickerOpen(true);
                        return;
                    }
                    input_ref.current?.focus();
                }}
                style={[Styles.inputContainer, error && Styles.inputError]}>
                {getInputIcon()}
                <TextInput
                    ref={input_ref}
                    editable={!disabled && !isDate}
                    style={[Styles.input, !!multiLine && Styles.inputArea]}
                    value={isDate ? getDateText(value, isDate) : value}
                    onChangeText={setValue}
                    placeholder={placeholder}
                    placeholderTextColor={theme.inputPlaceholderColor}
                    maxLength={maxLength}
                    secureTextEntry={isPassword && hidePassword}
                    multiline={!!multiLine}
                    numberOfLines={multiLine || 1}
                />
                {getPasswordHideButton()}
            </View>
            {getError()}

            {isDate && (
                <DateTimePickerModal
                    mode={isDate === "datetime" ? "datetime" : "date"}
                    isVisible={datePickerOpen}
                    date={datePickerDate}
                    themeVariant={theme.id === DarkTheme.id ? "dark" : "light"}
                    onConfirm={date => {
                        setDatePickerOpen(false);
                        setValue && setValue(date.toISOString());
                    }}
                    onCancel={() => {
                        setDatePickerOpen(false);
                    }}
                />
            )}
        </View>
    );
};

export default AppFormInput;

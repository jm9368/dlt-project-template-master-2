// Component: AppButton
// App custom button

import { TouchableOpacity, Text } from "react-native";
import { useThemedStyle } from "../../style/themed-style";
import AppButtonStyles from "../../style/utils/app-button";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { IconProp } from "@fortawesome/fontawesome-svg-core";

export type AppButtonKind = "primary" | "warning" | "secondary" | "danger" | "success" | "info";

export interface AppButtonProps {
    /**
     * Callback to the called when pressing the button
     */
    onPress?: () => void;

    /**
     * Title of the button
     */
    title: string;

    /**
     * True for the button to gain width of 100%
     */
    fullSize?: boolean;

    /**
     * Kind of button. Defines its color
     */
    kind?: AppButtonKind;

    /**
     * True if the button is disabled
     */
    disabled?: boolean;

    /**
     * Custom horizontal padding for the button
     */
    paddingH?: number;

    /**
     * Custom vertical padding for the button
     */
    paddingV?: number;

    /**
     * Text size
     */
    size?: number;

    /**
     * Icon
     */
    icon?: IconProp;
}

const AppButton = ({ onPress, title, fullSize, kind, disabled, paddingH, paddingV, size, icon }: AppButtonProps) => {
    const Styles = useThemedStyle(AppButtonStyles);

    const ContainerKindStyles = {
        danger: Styles.dangerContainer,
        warning: Styles.warningContainer,
        secondary: Styles.secondaryContainer,
        success: Styles.successContainer,
        info: Styles.infoContainer,
    };

    const TextKindStyles = {
        danger: Styles.dangerText,
        warning: Styles.warningText,
        secondary: Styles.secondaryText,
        success: Styles.successText,
        info: Styles.infoText,
    };

    const touchableStyles = [
        Styles.appButtonContainer,
        fullSize && Styles.appButtonContainerFullSize,
        disabled && Styles.disabled,
        ContainerKindStyles[kind],
        paddingH && { paddingHorizontal: paddingH },
        paddingV && { paddingVertical: paddingV },
    ];

    return (
        <TouchableOpacity disabled={disabled} onPress={onPress} style={touchableStyles}>
            {icon && <FontAwesomeIcon icon={icon} color="#fff" size={size || 18} />}
            <Text
                style={[
                    Styles.appButtonText,
                    icon && Styles.appButtonTextWithIcon,
                    icon && size && { marginLeft: size },
                    TextKindStyles[kind],
                    size && { fontSize: size },
                ]}>
                {title}
            </Text>
        </TouchableOpacity>
    );
};

export default AppButton;

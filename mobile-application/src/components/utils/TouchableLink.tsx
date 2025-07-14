// Component: TouchableLink
// App custom touchable link

import { TouchableOpacity, Text } from "react-native";
import { useThemedStyle } from "../../style/themed-style";
import TouchableLinkStyles from "../../style/utils/touchable-link";

export interface TouchableLinkProps {
    /**
     * Children text
     */
    children: string;

    /**
     * Callback to call when pressing the button
     */
    onPress?: () => void;

    /**
     * True if the text is small
     */
    small?: boolean;

    /**
     * True if the text needs to be underlined
     */
    underline?: boolean;

    /**
     * Custom font size
     */
    size?: number;
}

const TouchableLink = ({ children, onPress, small, underline, size }: TouchableLinkProps) => {
    const Styles = useThemedStyle(TouchableLinkStyles);

    const textStyles = [Styles.text, small && Styles.small, underline && Styles.underline, size && { fontSize: size }];

    return (
        <TouchableOpacity onPress={onPress} style={Styles.container}>
            <Text style={textStyles}>{children}</Text>
        </TouchableOpacity>
    );
};

export default TouchableLink;

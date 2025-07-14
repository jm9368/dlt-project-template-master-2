// Component: GuideBox
// Displays a guide message to the user

import { TouchableOpacity, Text, View, DimensionValue } from "react-native";
import { useThemedStyle } from "../../style/themed-style";
import GuideBoxStyles from "../../style/utils/guide-box";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { useTheme } from "../../style/theme-context";
import { useTranslation } from "../../hooks/translation";

export interface GuideBoxProps {
    /**
     * Title
     */
    title: string;

    /**
     * Message
     */
    message: string | string[];

    /**
     * Called on close / omit
     */
    onClose?: () => void;

    /**
     * Called on next
     */
    onNext?: () => void;

    /**
     * Box position
     */
    position: "top" | "bottom";

    /**
     * Vertical position
     */
    verticalPosition: DimensionValue;

    /**
     * Arrow left position
     */
    arrowLeft?: DimensionValue;

    /**
     * Arrow right position
     */
    arrowRight?: DimensionValue;

    /**
     * True if the message is the final one
     */
    isEnd: boolean;
}

const GuideBox = ({ title, message, position, verticalPosition, arrowLeft, arrowRight, onClose, onNext, isEnd }: GuideBoxProps) => {
    const Styles = useThemedStyle(GuideBoxStyles);

    const { t } = useTranslation();

    const { theme } = useTheme();

    return (
        <View
            style={[
                Styles.container,
                position === "top" && { top: verticalPosition },
                position === "bottom" && { bottom: verticalPosition },
            ]}>
            <View
                style={[
                    position === "top" && Styles.triangleTop,
                    position === "bottom" && Styles.triangleBottom,
                    { left: arrowLeft, right: arrowRight },
                ]}
            />
            <View
                style={[
                    position === "top" && Styles.triangleTopBorderHidden,
                    position === "bottom" && Styles.triangleBottomBorderHidden,
                    { left: arrowLeft, right: arrowRight },
                ]}
            />

            <View style={Styles.closeButtonRow}>
                <TouchableOpacity style={Styles.closeButton} onPress={onClose}>
                    <FontAwesomeIcon icon="times" size={16} color={theme.text} />
                </TouchableOpacity>
            </View>

            <View style={Styles.titleRow}>
                <Text style={Styles.title}>{title}</Text>
            </View>

            {Array.isArray(message) ? (
                message.map((m, i) => {
                    return (
                        <View key={i} style={Styles.messageRow}>
                            <Text style={Styles.message}>{m}</Text>
                        </View>
                    );
                })
            ) : (
                <View style={Styles.messageRow}>
                    <Text style={Styles.message}>{message}</Text>
                </View>
            )}

            <View style={Styles.buttonsRow}>
                <TouchableOpacity style={Styles.omitButton} onPress={onClose}>
                    <Text style={Styles.omitButtonText}>{t("Omit")}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={Styles.nextButton} onPress={onNext}>
                    <Text style={Styles.nextButtonText}>{isEnd ? t("Done") : t("Next")}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default GuideBox;

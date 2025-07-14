// Component: AuthScreenBase
// Servers as a base for any auth screens

import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import AuthBaseStyles from "../../../style/screens/auth-base";
import { useThemedStyle } from "../../../style/themed-style";
import { View, Platform, KeyboardAvoidingView } from "react-native";

export default function AuthScreenBase({ children }: any) {
    const Styles = useThemedStyle(AuthBaseStyles);

    return (
        <KeyboardAvoidingView
            enabled={Platform.OS !== "ios"}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={Styles.container}>
            <KeyboardAwareScrollView
                nestedScrollEnabled
                alwaysBounceVertical={false}
                style={Styles.scrollContainer}
                contentContainerStyle={Styles.scrollContent}>
                <View style={Styles.childrenContainer}>{children}</View>
            </KeyboardAwareScrollView>
        </KeyboardAvoidingView>
    );
}

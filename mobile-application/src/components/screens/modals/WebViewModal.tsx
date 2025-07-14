// Component: WebViewModal
// Displays a web view for the user to use external services like Stripe or PayPal

import { View, Text, TouchableOpacity, Platform } from "react-native";
import { useThemedStyle } from "../../../style/themed-style";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { useTheme } from "../../../style/theme-context";
import { NavigationProp, useRoute } from "@react-navigation/native";
import WebViewModalStyles from "../../../style/modals/modal-webview";
import { WebView } from "react-native-webview";
import { ShouldStartLoadRequest } from "react-native-webview/lib/WebViewTypes";
import { NavigationCallbacks } from "../../../control/navigation-callbacks";

const USER_AGENT =
    Platform.OS === "ios"
        ? "Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/120.0.6099.119 Mobile/15E148 Safari/604.1"
        : "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.144 Mobile Safari/537.36";

export default function WebViewModal({ navigation }: { navigation: NavigationProp<any> }) {
    const Styles = useThemedStyle(WebViewModalStyles);

    const { theme } = useTheme();

    const route = useRoute();

    const title = (route.params as any)["title"] || "";
    const source = (route.params as any)["src"] || "";

    const onLoadStart = (e: ShouldStartLoadRequest) => {
        const url = e.url;

        if (typeof NavigationCallbacks.WebViewSuccessURL === "string") {
            if (NavigationCallbacks.WebViewSuccessURL === url) {
                navigation.goBack();
                if (NavigationCallbacks.WebViewSuccessCallback) {
                    NavigationCallbacks.WebViewSuccessCallback(url);
                }
                return false;
            }
        } else if (typeof NavigationCallbacks.WebViewSuccessURL === "function") {
            if (NavigationCallbacks.WebViewSuccessURL(url)) {
                navigation.goBack();
                if (NavigationCallbacks.WebViewSuccessCallback) {
                    NavigationCallbacks.WebViewSuccessCallback(url);
                }
                return false;
            }
        } else if (NavigationCallbacks.WebViewSuccessURL instanceof RegExp) {
            if (NavigationCallbacks.WebViewSuccessURL.test(url)) {
                navigation.goBack();
                if (NavigationCallbacks.WebViewSuccessCallback) {
                    NavigationCallbacks.WebViewSuccessCallback(url);
                }
                return false;
            }
        }

        return true;
    };

    return (
        <View style={Styles.container}>
            <View style={Styles.containerInner}>
                <View style={Styles.header}>
                    <View style={Styles.headerInner}>
                        <View style={Styles.titleContainer}>
                            <Text style={Styles.title}>{title}</Text>
                        </View>
                        <View style={Styles.closeButtonContainer}>
                            <TouchableOpacity
                                style={Styles.closeButton}
                                onPress={() => {
                                    navigation.goBack();
                                }}>
                                <FontAwesomeIcon icon="times" size={26} color={theme.text} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
                <View style={Styles.webViewContainer}>
                    <WebView
                        source={{ uri: source }}
                        style={{ flex: 1 }}
                        userAgent={USER_AGENT}
                        onShouldStartLoadWithRequest={onLoadStart}
                    />
                </View>
            </View>
        </View>
    );
}

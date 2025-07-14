// Component: AppWrapper
// Wrapper for the whole app

import { View } from "react-native";
import { useTheme } from "../../style/theme-context";
import { useThemedStyle } from "../../style/themed-style";
import AppWrapperStyles from "../../style/utils/app-wrapper";
import { StatusBar } from "expo-status-bar";
import DarkTheme from "../../style/dark";

export default function AppWrapper({ children }) {
    const { theme } = useTheme();

    const Styles = useThemedStyle(AppWrapperStyles);

    return (
        <View style={Styles.container}>
            <StatusBar style={theme.id === DarkTheme.id ? "light" : "dark"} backgroundColor={theme.background} />
            {children}
        </View>
    );
}

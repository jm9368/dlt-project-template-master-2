// Component AppLoader
// This component renders a loading screen for any means necessary

import { ActivityIndicator, RefreshControl, ScrollView } from "react-native";
import { useThemedStyle } from "../../style/themed-style";
import AppLoaderStyles from "../../style/screens/app-loader";
import { useTheme } from "../../style/theme-context";
import { AuthController } from "../../control/auth";

export default function AppLoader() {
    const Styles = useThemedStyle(AppLoaderStyles);

    const { theme } = useTheme();

    return (
        <ScrollView
            contentContainerStyle={Styles.container}
            bounces={false}
            refreshControl={
                <RefreshControl
                    refreshing={false}
                    onRefresh={() => {
                        AuthController.CheckAuthStatus();
                    }}
                />
            }>
            <ActivityIndicator size="large" color={theme.activityIndicatorColor} />
        </ScrollView>
    );
}

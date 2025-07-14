// Component: AuthLoadingScreen
// Displays a loading screen and redirects to other screen depending on the status

import { NavigationProp, useFocusEffect } from "@react-navigation/native";
import AppLoader from "../AppLoader";
import { AppEvents } from "../../../control/app-events";
import { useEffect, useState } from "react";
import { AppPreferences } from "../../../control/app-preferences";
import { AuthController } from "../../../control/auth";
import { useAuth } from "../../../hooks/auth";

export default function AuthLoadingScreen({ navigation }: { navigation: NavigationProp<any> }) {
    const performRedirects = () => {
        if (!AppPreferences.Loaded || !navigation.isFocused()) {
            return;
        }

        if (!AppPreferences.OnboardingScreensPassed) {
            // First time the user opens the app, show onboarding screens
            navigation.navigate("InitialScreen");
        }

        if (AuthController.Loading) {
            return; // Still loading
        }

        if (AuthController.isAuthenticated()) {
            // Redirect to home
            navigation.navigate("HomeScreen");
            return;
        }

        if (AuthController.isAskingForTwoFactor()) {
            // Redirect to TFA login
            navigation.navigate("TFALoginScreen");
            return;
        }

        navigation.navigate("LoginScreen");
    };

    const [focus, setFocus] = useState(false);

    const { loading } = useAuth();

    useFocusEffect(() => {
        setFocus(true);

        return () => {
            setFocus(false);
        };
    });

    useEffect(() => {
        performRedirects();
    }, [loading, focus]);

    useEffect(() => {
        AppEvents.AddEventListener("preferences-loaded", performRedirects);
        return () => {
            AppEvents.RemoveEventListener("preferences-loaded", performRedirects);
        };
    }, []);

    return <AppLoader />;
}

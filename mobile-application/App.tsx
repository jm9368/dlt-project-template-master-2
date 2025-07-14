// App entry point

"use strict";

import "react-native-url-polyfill/auto";
import { ActualHeightProvider } from "./src/style/actual-height";
import { InternationalizationService } from "./src/control/i18n";
import { useEffect, useState } from "react";
import { LocalStorage } from "./src/control/local-storage";
import { AuthController } from "./src/control/auth";
import { AppPreferences } from "./src/control/app-preferences";
import { useFonts } from "expo-font";
import { ThemeProvider } from "./src/style/theme-context";
import LightTheme from "./src/style/light";
import AppLoader from "./src/components/screens/AppLoader";
import DarkTheme from "./src/style/dark";
import AppRouter from "./src/components/router";

/* Import Font awesome icons */

import { library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { fab } from "@fortawesome/free-brands-svg-icons";
import { WalletsController } from "./src/control/wallets";
import AppWrapper from "./src/components/utils/AppWrapper";

library.add(fas);
library.add(fab);

/* App component */

export default function App() {
    const [loaded] = useFonts({
        Sora: require("./assets/fonts/Sora-VariableFont_wght.ttf"),
    });

    const [configLoaded, setConfigLoaded] = useState(false);

    const [initialTheme, setInitialTheme] = useState(LightTheme.id);

    useEffect(() => {
        // Initialization of global stuff here
        LocalStorage.Load().then(() => {
            AppPreferences.LoadPreferences();

            if (AppPreferences.Language) {
                InternationalizationService.ChangeLanguage(AppPreferences.Language);
            } else {
                AppPreferences.Language = InternationalizationService.Locale;
            }

            setInitialTheme(AppPreferences.Theme);

            AuthController.Initialize();
            WalletsController.Initialize();

            setConfigLoaded(true);
        });
    }, []);

    if (!loaded || !configLoaded) {
        return (
            <ActualHeightProvider>
                <ThemeProvider key={initialTheme} initial={initialTheme === DarkTheme.id ? DarkTheme : LightTheme}>
                    <AppWrapper>
                        <AppLoader />
                    </AppWrapper>
                </ThemeProvider>
            </ActualHeightProvider>
        );
    }

    return (
        <ActualHeightProvider>
            <ThemeProvider key={initialTheme} initial={initialTheme === DarkTheme.id ? DarkTheme : LightTheme}>
                <AppWrapper>
                    <AppRouter />
                </AppWrapper>
            </ThemeProvider>
        </ActualHeightProvider>
    );
}

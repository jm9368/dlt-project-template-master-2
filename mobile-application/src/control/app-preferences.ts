// App preferences

"use strict";

import { AppEvents } from "./app-events";
import { LocalStorage } from "./local-storage";
import Constants from "expo-constants";
export class AppPreferences {
    public static Language = "en";

    public static Theme = "light";

    public static OnboardingScreensPassed = false;

    public static Loaded = false;

    public static LoadPreferences() {
        AppPreferences.Theme = LocalStorage.Get("app-pref-theme", "light");
        AppPreferences.Language = LocalStorage.Get("app-pref-lang", "");

        if (!Constants.expoConfig.extra.always_show_initial_screen) {
            AppPreferences.OnboardingScreensPassed = LocalStorage.Get("onboarding-screens-passed", false);
        } else {
            AppPreferences.OnboardingScreensPassed = false;
        }

        AppPreferences.Loaded = true;
        AppEvents.Emit("preferences-loaded");
    }

    public static SetLanguage(lang: string) {
        AppPreferences.Language = lang;
        LocalStorage.Set("app-pref-lang", lang);
    }

    public static SetTheme(t: string) {
        AppPreferences.Theme = t;
        LocalStorage.Set("app-pref-theme", t);
        AppEvents.Emit("theme-changed", t);
    }

    public static SetOnboardingScreensPassed() {
        AppPreferences.OnboardingScreensPassed = true;
        LocalStorage.Set("onboarding-screens-passed", true);
    }

    public static getDefaultWallet(uid: string) {
        return LocalStorage.Get("app-pref-default-wallet-" + uid, "");
    }

    public static setDefaultWallet(uid: string, wallet: string) {
        LocalStorage.Set("app-pref-default-wallet-" + uid, wallet);
    }
}

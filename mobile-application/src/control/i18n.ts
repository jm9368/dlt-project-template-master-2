// Internationalization

"use strict";

import { getLocales } from "expo-localization";
import { AppEvents } from "./app-events";

/**
 * Available languages
 */
export const AVAILABLE_LANGUAGES: { id: string; name: string; loader: () => Promise<any> }[] = [
    {
        id: "en",
        name: "English",
        loader: async () => {
            return require("../locales/locale-en.json");
        },
    },
    {
        id: "es",
        name: "Español (Internacional)",
        loader: async () => {
            return require("../locales/locale-es.json");
        },
    },
];

/**
 * List of supported locales
 */
export const SUPPORTED_LOCALES = AVAILABLE_LANGUAGES.map(l => l.id);

/**
 * Fallback locale
 */
export const FALLBACK_LOCALE = SUPPORTED_LOCALES[0];

/**
 * Finds locale by comparing the prefix
 * @param languages List of languages
 * @param locale The locale
 * @returns The index found, or -1
 */
function findLocaleByPrefix(languages: readonly string[], locale: string): number {
    const localePrefix = locale.split("-")[0];
    for (let i = 0; i < languages.length; i++) {
        const langPrefix = languages[i].split("-")[0];

        if (langPrefix === localePrefix) {
            return i;
        }
    }

    return -1;
}

/**
 * Detects navigator language and chooses the best available locale
 * @returns The best available locale
 */
export function detectDeviceLanguage(): string {
    const deviceLanguage = getLocales().map(l => l.languageTag);

    const localesSorted = SUPPORTED_LOCALES.sort((a, b) => {
        const iA = deviceLanguage.indexOf(a);
        const iB = deviceLanguage.indexOf(b);

        if (iA === -1 && iB === -1) {
            const jA = findLocaleByPrefix(deviceLanguage, a);
            const jB = findLocaleByPrefix(deviceLanguage, b);

            if (jA === -1 && jB === -1) {
                if (a === FALLBACK_LOCALE) {
                    return -1;
                } else {
                    return 1;
                }
            } else if (jA === -1) {
                return 1;
            } else if (jB === -1) {
                return -1;
            } else if (jA < jB) {
                return -1;
            } else {
                return 1;
            }
        } else if (iA === -1) {
            return 1;
        } else if (iB === -1) {
            return -1;
        } else if (iA < iB) {
            return -1;
        } else {
            return 1;
        }
    });

    return localesSorted[0] || FALLBACK_LOCALE;
}

/**
 * Internationalization service
 */
export class InternationalizationService {
    public static Locale = "en";

    public static LoadedLocale = "";

    public static LocaleData: Map<string, string> = new Map();

    /**
     * Initialization logic
     */
    public static Initialize() {
        InternationalizationService.Locale = detectDeviceLanguage();
        InternationalizationService.LoadLocale(InternationalizationService.Locale);
    }

    public static LoadLocale(locale: string) {
        const loader = AVAILABLE_LANGUAGES.filter(l => l.id === locale)[0]?.loader;

        if (loader) {
            loader()
                .then(localeData => {
                    if (locale !== InternationalizationService.Locale) {
                        return; // Changed while loading
                    }

                    InternationalizationService.LocaleData.clear();
                    for (const key of Object.keys(localeData)) {
                        InternationalizationService.LocaleData.set(key, localeData[key]);
                    }
                    InternationalizationService.LoadedLocale = locale;
                    AppEvents.Emit("loaded-locale", locale);
                })
                .catch(err => {
                    console.error(err);
                });
        }
    }

    public static ChangeLanguage(locale: string) {
        if (!SUPPORTED_LOCALES.includes(locale)) {
            return;
        }
        InternationalizationService.Locale = locale;
        InternationalizationService.LoadLocale(InternationalizationService.Locale);
    }

    public static Translate(text: string, locale: string) {
        if (locale !== InternationalizationService.LoadedLocale) {
            return text;
        }
        return (InternationalizationService.LocaleData.get(text) || text).trim();
    }
}

InternationalizationService.Initialize();

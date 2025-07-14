// Translation hook

"use struct";

import { useCallback, useEffect, useState } from "react";
import { InternationalizationService } from "../control/i18n";
import { AppEvents } from "../control/app-events";

/**
 * Translation hook
 */
export const useTranslation: () => { t: (str: string) => string; language: string } = () => {
    const [language, setLanguage] = useState(InternationalizationService.LoadedLocale);

    const t = useCallback(
        (str: string) => {
            return InternationalizationService.Translate(str, language);
        },
        [language],
    );

    useEffect(() => {
        AppEvents.AddEventListener("loaded-locale", setLanguage);

        return () => {
            AppEvents.RemoveEventListener("loaded-locale", setLanguage);
        };
    }, []);

    return { t, language };
};

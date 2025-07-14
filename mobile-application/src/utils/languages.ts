// Languages utilities

"use strict";

import { AVAILABLE_LANGUAGES } from "../control/i18n";

export function renderLanguage(lng: string) {
    for (const language of AVAILABLE_LANGUAGES) {
        if (language.id === lng) {
            return language.name;
        }
    }

    return lng.toUpperCase();
}

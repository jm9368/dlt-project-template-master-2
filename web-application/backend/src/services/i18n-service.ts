// Internationalization service

"use strict";

import { readdirSync } from "fs";
import Path from "path";
import I18N from "i18n";
import Express from "express";
import { User } from "../models/users/user";
import { Monitor } from "../monitor";

/**
 * Default locale
 */
export const DEFAULT_LOCALE = "en";

/**
 * Translator
 */
export interface Translator {
    /**
     * Translates a text
     * @param text The text to translate
     * @returns The translated text
     */
    __: (text: string) => string;
}

/**
 * Internationalization service
 */
export class InternationalizationService {
    /* Singleton */

    public static instance: InternationalizationService = null;

    public static getInstance(): InternationalizationService {
        if (InternationalizationService.instance) {
            return InternationalizationService.instance;
        } else {
            InternationalizationService.instance = new InternationalizationService();
            return InternationalizationService.instance;
        }
    }

    /**
     * Available locales
     */
    public availableLocales: Set<string>;

    constructor() {
        const localesPath = Path.resolve(__dirname, "..", "..", "locales");
        const locales = readdirSync(localesPath).filter(a => a.endsWith(".json")).map(a => a.split(".")[0]);
        this.availableLocales = new Set(locales);
        I18N.configure({
            locales: locales,
            directory: localesPath,
            cookie: "locale",
            extension: ".json",
            defaultLocale: DEFAULT_LOCALE,
            logWarnFn: msg => {
                Monitor.debug("[I18N-WARN] " + msg);
            }
        });
    }

    /**
     * Uses the translation for express
     * @param application The express application
     */
    public use(application: Express.Express) {
        application.use(I18N.init);
    }

    /**
     * Gets a translator
     * @param language The language
     * @returns The translator
     */
    public getTranslator(language: string): Translator {
        return {
            __: function (text: string) {
                return I18N.__({
                    phrase: text,
                    locale: language,
                });
            },
        };
    }

    /**
     * Gets a translator from request or user
     * @param request The HTTP request
     * @param user The user
     * @returns The translator
     */
    public getTranslatorFromRequestOrUser(request: Express.Request | null, user: User | null) {
        if (user && user.locale) {
            return this.getTranslator(user.locale);
        } else if (request) {
            return this.getTranslator(request.getLocale());
        } else {
            return this.getTranslator(DEFAULT_LOCALE);
        }
    }
}
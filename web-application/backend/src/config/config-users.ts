// Reserved for license

"use strict";

import { Config } from "./config";

/**
 * Route for google callback
 */
export const GOOGLE_CALLBACK_ROUTE = "/callbacks/google";

/**
 * Google OAuth 2.0 config
 */
class GoogleOAuthConfiguration {
    public clientId: string;
    public clientSecret: string;

    constructor() {
        this.clientId = "";
        this.clientSecret = "";
    }
}

/**
 * User system config
 */
export class UserSystemConfig {

    /**
     * Gets the configuration instance.
     */
    public static getInstance(): UserSystemConfig {
        if (UserSystemConfig.instance) {
            return UserSystemConfig.instance;
        }

        const config: UserSystemConfig = new UserSystemConfig();

        config.emailValidationDisabled = process.env.DISABLE_EMAIL_VALIDATION === "YES";

        config.google.clientId = process.env.GOOGLE_LOGIN_CLIENT_ID || "";
        config.google.clientSecret = process.env.GOOGLE_LOGIN_CLIENT_SECRET || "";

        config.forceUserAdmin = process.env.USER_ALWAYS_ADMIN || ""; 

        config.initialUserName = process.env.INITIAL_USER_NAME || "admin"; 
        config.initialUserPassword = process.env.INITIAL_USER_PASSWORD || "password"; 

        UserSystemConfig.instance = config;

        return config;
    }
    private static instance: UserSystemConfig = null;

    public emailValidationDisabled: boolean;

    public forceUserAdmin: string;

    public initialUserName: string;
    public initialUserPassword: string;

    public google: GoogleOAuthConfiguration;

    constructor() {
        this.emailValidationDisabled = false;

        this.forceUserAdmin = "";

        this.initialUserName = "";
        this.initialUserPassword = "";

        this.google = new GoogleOAuthConfiguration();
    }
}

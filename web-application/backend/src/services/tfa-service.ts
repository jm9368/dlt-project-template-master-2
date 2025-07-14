// Reserved for license

"use strict";

import speakeasy from "speakeasy";
import { Config } from "../config/config";

const PLATFORM_NAME = Config.getInstance().appName;

export const TOTP_STEP = 60;

/**
 * Two factor authentication service
 */
export class TwoFactorAuthenticationService {
    /* Singleton */

    public static instance: TwoFactorAuthenticationService = null;

    public static getInstance(): TwoFactorAuthenticationService {
        if (TwoFactorAuthenticationService.instance) {
            return TwoFactorAuthenticationService.instance;
        } else {
            TwoFactorAuthenticationService.instance = new TwoFactorAuthenticationService();
            return TwoFactorAuthenticationService.instance;
        }
    }

    constructor() {

    }

    /**
     * Generates TFA secret
     * @param userName User name
     * @returns Secret and URI for QR code
     */
    public generateSecret(userName: string): { secret: string, uri: string } {
        const secret = speakeasy.generateSecret().base32;

        const baseURL = speakeasy.otpauthURL({
            type: "totp",
            secret: secret,
            issuer: PLATFORM_NAME,
            label: encodeURIComponent((userName).normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s/g, "_")),
            period: TOTP_STEP,
            encoding: "base32",
        });

        return {
            secret,
            uri: baseURL,
        };
    }

    /**
     * Checks TFA token
     * @param token Token
     * @param secret Secret
     * @returns True if it is valid, False if invalid
     */
    public check(token: string, secret: string): boolean {
        try {
            return speakeasy.totp.verify({ secret: secret, encoding: 'base32', token: token, step: TOTP_STEP });
        } catch (ex) {
            return false;
        }
    }
}

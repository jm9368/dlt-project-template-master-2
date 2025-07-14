// Reserved for license

"use strict";

/**
 * Captcha mode
 */
export type CaptchaMode = "reCAPTCHA" | "none";

/**
 * Captcha configuration.
 */
export class CaptchaConfig {

    /**
     * Gets the configuration instance.
     */
    public static getInstance(): CaptchaConfig {
        if (CaptchaConfig.instance) {
            return CaptchaConfig.instance;
        }

        const config: CaptchaConfig = new CaptchaConfig();

        switch ((process.env.CAPTCHA_SERVICE + "").toLowerCase()) {
            case "recaptcha":
                config.captchaMode = "reCAPTCHA";
                config.siteId = process.env.CAPTCHA_SITE_ID || "";
                config.secret = process.env.CAPTCHA_SECRET || "";
                break;
            default:
                config.captchaMode = "none";
        }



        CaptchaConfig.instance = config;

        return config;
    }
    private static instance: CaptchaConfig = null;

    public siteId: string;
    public secret: string;

    public captchaMode: CaptchaMode;

    constructor() {
        this.captchaMode = "none";
        this.siteId = "";
        this.secret = "";
    }
}

// Captcha service

"use strict";

import { CaptchaConfig, CaptchaMode } from "../config/config-captcha";
import { verifyReCaptcha } from "../utils/recaptcha";

export class CaptchaService {
    /* Singleton */

    public static instance: CaptchaService = null;

    public static getInstance(): CaptchaService {
        if (CaptchaService.instance) {
            return CaptchaService.instance;
        } else {
            CaptchaService.instance = new CaptchaService();
            return CaptchaService.instance;
        }
    }

    public mode: CaptchaMode;

    constructor() {
        this.mode = CaptchaConfig.getInstance().captchaMode;
    }

    /**
     * Verifies captcha
     * @param captcha The captcha token
     * @param expectedAction The expected action name
     * @returns True if the captcha is passed 
     */
    public async verifyCaptcha(captcha: string, expectedAction: string): Promise<boolean> {
        switch (this.mode) {
            case "reCAPTCHA":
                return verifyReCaptcha(captcha, expectedAction);
            default:
                return true;
        }
    }
}

/* eslint react-hooks/rules-of-hooks: 0 */

"use strict";

import Constants from "expo-constants";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";

/**
 * Hook to use the captcha service
 * Returns a function to request a captcha token
 */
export const useCaptcha: () => (action: string) => Promise<string> = () => {
    if (Constants.expoConfig.extra.reCaptchaKey) {
        const { executeRecaptcha } = useGoogleReCaptcha();

        return async (action: string) => {
            if (!executeRecaptcha) {
                return "";
            }

            try {
                const token = await executeRecaptcha(action);
                return token;
            } catch (ex) {
                console.error(ex);
                return "";
            }
        };
    } else {
        return async () => {
            return "";
        };
    }
};

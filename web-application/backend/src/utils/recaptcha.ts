/* Google recaptcha */

import { CaptchaConfig } from "../config/config-captcha";
import { Monitor } from "../monitor";
import { Request } from "./request";

export async function verifyReCaptcha(captcha: string, expectedAction: string): Promise<boolean> {
    if (!captcha) {
        return false;
    }
    return new Promise<boolean>((resolve) => {
        Request.post("https://www.google.com/recaptcha/api/siteverify", {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': "application/json",
            },
            body: `secret=${encodeURIComponent(CaptchaConfig.getInstance().secret)}&response=${encodeURIComponent(captcha)}`,
        }, (err, response, body) => {
            if (err) {
                Monitor.debugException(err);
                return resolve(false);
            }

            try {
                const resBody: any = JSON.parse(body);

                const success = resBody.success;
                const action = resBody.action;
        
                if (success && action === expectedAction) {
                    resolve(true); // Verified
                } else {
                    Monitor.debug("Captcha response", resBody);
                    resolve(false); // Not verified
                }
            } catch (ex) {
                Monitor.exception(ex);
                resolve(false);
            }
        });
    });
}

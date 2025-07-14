// Reserved for license

"use strict";

import Mailer from "nodemailer";
import { MailerConfig } from "../config/config-mail";
import { Monitor } from "../monitor";
import { Config } from "../config/config";

const PLATFORM_NAME = Config.getInstance().appName;

/**
 * Mail service
 */
export class MailService {
    /* Singleton */

    public static instance: MailService = null;

    public static getInstance(): MailService {
        if (MailService.instance) {
            return MailService.instance;
        } else {
            MailService.instance = new MailService();
            return MailService.instance;
        }
    }

    private mailTransporter: Mailer.Transporter;

    constructor() {
        if (MailerConfig.getInstance().enabled) {
            const config = MailerConfig.getInstance();
            this.mailTransporter = Mailer.createTransport({
                host: config.host,
                port: config.port,
                secure: config.secure,
                from: config.from,
                auth: {
                    user: config.user,
                    pass: config.password,
                },
                tls: {
                    rejectUnauthorized: config.tlsRejectUnauthorized,
                },
            });
        }
    }

    /**
     * Sends email
     * @param destination Destination email. 
     * @param subject Subject
     * @param text Text body
     * @param html HTML body (by default most clients will show this one over the text one)
     */
    public async sendMail(destination: string, subject: string, text: string, html: string) {
        if (!MailerConfig.getInstance().enabled) {
            Monitor.debug(`[MAIL] to=${destination}, subject=${subject}, content=${html}`);
            return;
        }

        try {
            await this.mailTransporter.sendMail({
                from: `"${PLATFORM_NAME}" ${MailerConfig.getInstance().from}`,
                to: destination,
                subject: subject,
                text: text,
                html: html,
            });
            Monitor.debug(`Email sent to ${destination}`);
        } catch (e) {
            Monitor.error(`Could not send verification email to ${destination} | Error: ${e.message}`);
            throw e;
        }
    }
}
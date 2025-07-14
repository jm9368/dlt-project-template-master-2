// Reserved for license

"use strict";

/**
 * Mailer configuration.
 */
export class MailerConfig {

    /**
     * Gets the configuration instance.
     */
    public static getInstance(): MailerConfig {
        if (MailerConfig.instance) {
            return MailerConfig.instance;
        }

        const config: MailerConfig = new MailerConfig();

        config.enabled = process.env.MAIL_ENABLED !== "NO";

        config.host = process.env.SMTP_HOST || "";
        config.port = parseInt(process.env.SMTP_PORT || "587", 10) || 587;

        config.secure = process.env.SMTP_SECURE === "YES";

        config.from = process.env.SMTP_FROM || "";

        config.user = process.env.SMTP_AUTH_USER || "";
        config.password = process.env.SMTP_AUTH_PASSWORD || "";

        config.tlsRejectUnauthorized = process.env.SMTP_TLS_REJECT_UNAUTHORIZED !== "NO"; 

        MailerConfig.instance = config;

        return config;
    }
    private static instance: MailerConfig = null;

    public enabled: boolean;

    public host: string;
    public port: number;

    public secure: boolean;

    public from: string;

    public user: string;
    public password: string;

    public tlsRejectUnauthorized: boolean;
}

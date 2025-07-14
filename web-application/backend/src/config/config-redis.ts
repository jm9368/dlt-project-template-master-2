// Reserved for license

"use strict";

/**
 * Redis configuration
 */
export class RedisConfig {

    /**
     * Gets the configuration instance.
     */
    public static getInstance(): RedisConfig {
        if (RedisConfig.instance) {
            return RedisConfig.instance;
        }

        const config: RedisConfig = new RedisConfig();

        config.enabled = process.env.REDIS_ENABLED !== "NO";

        config.host = process.env.REDIS_HOST || "127.0.0.1";
        config.port = parseInt(process.env.REDIS_PORT || "6379") || 6379;
        config.password = process.env.REDIS_PASSWORD || "";

        config.tls = process.env.REDIS_TLS === "YES";

        RedisConfig.instance = config;

        return config;
    }
    private static instance: RedisConfig = null;

    public enabled: boolean;

    public host: string;
    public port: number;
    public password: string;

    public tls: boolean;

    constructor() {
        this.enabled = true;
        this.host = "127.0.0.1";
        this.port = 6379;
        this.password = "";
        this.tls = false;
    }
}

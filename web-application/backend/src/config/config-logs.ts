// Reserved for license

"use strict";

/**
 * Logs configuration 
 */
export class LogsConfig {

    /**
     * Gets the configuration instance.
     */
    public static getInstance(): LogsConfig {
        if (LogsConfig.instance) {
            return LogsConfig.instance;
        }

        const config: LogsConfig = new LogsConfig();

        config.logRequests = process.env.LOG_REQUESTS === "YES";

        config.logInfo = process.env.LOG_INFO !== "NO";
        config.logDebug = process.env.LOG_DEBUG === "YES";
        config.logTrace = process.env.LOG_TRACE === "YES";

        config.elasticSearchEnabled = process.env.LOG_ELASTIC_SEARCH_ENABLED === "YES";

        config.elasticNode = process.env.LOG_ELASTIC_SEARCH_NODE || "http://127.0.0.1:9200";

        config.elasticUser = process.env.LOG_ELASTIC_SEARCH_USER || "elastic";
        config.elasticPassword = process.env.LOG_ELASTIC_SEARCH_PASSWORD || "";

        config.elasticIndexPrefix = process.env.LOG_ELASTIC_SEARCH_INDEX_PREFIX || "app-log-";

        config.elasticTlsRejectUnauthorized = process.env.LOG_ELASTIC_SEARCH_TLS_REJECT_UNAUTHORIZED === "YES";
        
        LogsConfig.instance = config;

        return config;
    }
    private static instance: LogsConfig = null;

    public logRequests: boolean;

    public logInfo: boolean;
    public logDebug: boolean;
    public logTrace: boolean;

    public elasticSearchEnabled: boolean;
    public elasticNode: string;
    public elasticUser: string;
    public elasticPassword: string;
    public elasticIndexPrefix: string;
    public elasticTlsRejectUnauthorized: boolean;

    constructor() {
        this.logInfo = true;
        this.logRequests = true;
        this.logDebug = true;

        this.elasticSearchEnabled = false;
        this.elasticNode = "http://127.0.0.1:9200";
        this.elasticUser = "elastic";
        this.elasticPassword = "";
        this.elasticIndexPrefix = "app-log-";
        this.elasticTlsRejectUnauthorized = false;
    }
}

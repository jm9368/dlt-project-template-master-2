// Reserved for license

"use strict";

import OS from "os";
import { URL } from "url";

/**
 * Http configuration.
 */
export class HttpConfig {
    public port: number;
    public bindAddress: string;

    constructor() {
        this.port = 8080;
        this.bindAddress = "";
    }
}

/**
 * Https configuration.
 */
export class HttpsConfig extends HttpConfig {
    public certFile: string;
    public keyFile: string;

    constructor() {
        super();
        this.certFile = "";
        this.keyFile = "";
    }
}

/**
 * Application configuration.
 */
export class Config {

    /**
     * If this is true, the application is running on test mode
     * Use this frag to skip any non-test logic
     */
    public static IS_TEST = false;

    /**
     * Gets the configuration instance.
     */
    public static getInstance(): Config {
        if (Config.instance) {
            return Config.instance;
        }

        const config: Config = new Config();

        config.isProduction = process.env.NODE_ENV === "production";

        config.appName = process.env.APP_NAME || "Platform";
        config.appVersion = process.env.APP_VERSION || "0.0.1";

        config.isTaskRunner = process.env.RUN_TASKS === "YES";

        config.uriBackend = process.env.BACKEND_EXTERNAL_URI || "http://localhost";
        config.uriFrontend = process.env.FRONTEND_EXTERNAL_URI || "http://localhost";

        config.allowedOrigins = (process.env.ALLOWED_ORIGINS || "").split(",").map(a => a.trim()).filter(a => !!a);

        config.numberOfWorkers = parseInt(process.env.WORKERS_NUMBER || "0") || OS.cpus().length;

        // Set HTTP config
        config.http = new HttpConfig();
        config.http.port = parseInt(process.env.SERVER_HTTP_PORT || "80") || 80;
        config.http.bindAddress = process.env.SERVER_HTTP_ADDRESS || "";

        // Set https config
        config.https = new HttpsConfig();
        config.https.port = parseInt(process.env.SERVER_HTTPS_PORT || "443") || 443;
        config.https.bindAddress = process.env.SERVER_HTTPS_ADDRESS || "";
        config.https.certFile = process.env.SERVER_HTTPS_CERTIFICATE || "";
        config.https.keyFile = process.env.SERVER_HTTPS_KEY || "";

        config.redirectSecure = process.env.SERVER_REDIRECT_SECURE === "YES";

        config.maxUploadFileSize = Number(process.env.MAX_UPLOAD_FILE_SIZE || "1073741824") || (1073741824); // 1 GB by default

        config.usingProxy = process.env.USING_PROXY === "YES";

        config.serveFrontend = process.env.SERVE_FRONTEND !== "NO";
        config.frontendPath = process.env.FRONTEND_PATH || "../frontend/dist";

        config.serveAcmeChallenge = process.env.SERVE_ACME_CHALLENGE === "YES";
        config.acmeChallengePath = process.env.ACME_CHALLENGE_PATH || "/var/www/certbot";

        config.serveSwaggerDocs = process.env.SERVE_SWAGGER_DOCS !== "NO";

        Config.instance = config;

        return config;
    }
    private static instance: Config = null;

    public isProduction: boolean;

    public appName: string;

    public appVersion: string;

    public isTaskRunner: boolean;

    public uriBackend: string;
    public uriFrontend: string;

    public http: HttpConfig;
    public https: HttpsConfig;
    public numberOfWorkers: number;
    public redirectSecure: boolean;

    public maxUploadFileSize: number;

    public usingProxy: boolean;

    public allowedOrigins: string[];

    public serveFrontend: boolean;
    public frontendPath: string;

    public serveAcmeChallenge: boolean;
    public acmeChallengePath: string;

    public serveSwaggerDocs: boolean;

    /**
     * Gets the backend host
     * @returns The backend host
     */
    public getHost() {
        return (new URL(this.uriBackend)).hostname;
    }

    /**
     * Gets a backend URI
     * @param path The path
     * @returns The URI
     */
    public getBackendURI(path: string): string {
        return (new URL(path, this.uriBackend)).toString();
    }

    /**
     * Gets a frontend URI
     * @param path The path
     * @returns The URI
     */
    public getFrontendURI(path: string): string {
        return (new URL(path, this.uriFrontend)).toString();
    }
}

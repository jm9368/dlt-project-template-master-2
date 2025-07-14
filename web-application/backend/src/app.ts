// Reserved for license

"use strict";

import CORS from "cors";
import compression from "compression";
import CookieParser from "cookie-parser";
import Express from "express";
import ExpressUserAgent from "express-useragent";
import FS from "fs";
import HTTP from "http";
import I18N from "i18n";
import HTTPS from "https";
import Path from "path";
import WebSocket from "ws";
import { Config } from "./config/config";
import { Monitor } from "./monitor";
import { BAD_REQUEST, INTERNAL_SERVER_ERROR, getRequestRemoteAddress } from "./utils/http-utils";
import { WebsocketController } from "./controllers/websocket/websocket";
import { Controller } from "./controllers/controller";
import { DefaultController } from "./controllers/default/default-controller";
import SwaggerGenerator from "@asanrom/express-swagger-generator";
import { AddressInfo } from "net";
import { RequestLogger } from "./utils/request-log";
import { CertificatesWatcher } from "./certificates-watcher";

// Express async errors
require("express-async-errors");

const WEBSOCKET_PATH = "/websocket";

const PLATFORM_NAME = Config.getInstance().appName;

/**
 * Web Application.
 */
export class MainWebApplication {
    private application: Express.Express;
    private httpServer: HTTP.Server;
    private httpsServer: HTTPS.Server;

    constructor() {
        // Create and configure express application
        this.application = Express();

        // Cors
        this.application.use(CORS({
            origin: Config.getInstance().allowedOrigins,
            methods: ['GET', 'POST', 'PUT', 'DELETE'],
        }));

        // Firewall
        this.application.all("*", this.firewall.bind(this));

        // Webhooks
        this.registerWebhooks();

        // Middleware
        this.application.use(compression());
        this.addMiddleware(Express.json({ limit: "16mb" }));
        this.addMiddleware(Express.urlencoded({ limit: "16mb", extended: true }));
        this.addMiddleware(CookieParser());
        this.application.use(ExpressUserAgent.express());

        // Internationalization

        this.application.use(I18N.init);

        // Swagger
        if (Config.getInstance().serveSwaggerDocs) {
            try {
                SwaggerGenerator(this.application, {
                    swaggerDefinition: {
                        info: {
                            description: 'API documentation',
                            title: PLATFORM_NAME,
                            version: '1.0.0',
                        },
                        host: Config.getInstance().getHost(),
                        basePath: '/api/v1',
                        produces: [
                            "application/json"
                        ],
                        schemes: Config.getInstance().isProduction ? ['https'] : ['http', 'https'],
                        securityDefinitions: {
                            AuthToken: {
                                type: "apiKey",
                                in: "header",
                                name: "x-session-id",
                            },
                        },
                    },
                    basedir: __dirname, // App absolute path
                    files: ['./controllers/api/**/*.js', './controllers/api/**/*.ts'] // Path to the API handle folder
                });
            } catch (ex) {
                Monitor.exception(ex);
                Monitor.error("Cannot load module express-swagger-generator | API documentation will not be served.");
            }
        }

        // Controllers
        this.registerControllers();

        // Static files

        if (Config.getInstance().serveAcmeChallenge) {
            this.application.use("/.well-known/acme-challenge/", Express.static(Config.getInstance().acmeChallengePath, { maxAge: "" + (60) }));
        }

        if (Config.getInstance().serveFrontend) {
            this.application.use(Express.static(Config.getInstance().frontendPath, { maxAge: "" + (365 * 24 * 60 * 60) }));
        }

        // Default controller
        const defaultController = new DefaultController();
        defaultController.register(this.application);

        // Error handler
        this.application.use("*", this.errorHandler.bind(this));
    }

    /**
     * Starts the web application.
     */
    public start() {
        // HTTP
        if (Config.getInstance().http.port) {
            const http = HTTP.createServer(this.handle.bind(this)).on("error", (e: any) => {
                if (e.code === "EADDRINUSE") {
                    Monitor.error(`[HTTP] [FATAL] [EADDRINUSE] Address is in use, cannot bind to port ${Config.getInstance().http.port}`);
                }
            });

            this.httpServer = http;

            this.handleWebsocket(new WebSocket.Server({ server: http, path: WEBSOCKET_PATH }));

            http.listen(Config.getInstance().http.port, Config.getInstance().http.bindAddress, () => {
                Monitor.status(`[HTTP] Application listening on ${Config.getInstance().http.bindAddress}:${Config.getInstance().http.port}`);
            });
        }

        /// HTTPS
        if (Config.getInstance().https.port && Config.getInstance().https.certFile && Config.getInstance().https.keyFile) {
            const https = HTTPS.createServer({
                cert: FS.readFileSync(Config.getInstance().https.certFile),
                key: FS.readFileSync(Config.getInstance().https.keyFile),
            }, this.handle.bind(this)).on("error", (e: any) => {
                if (e.code === "EADDRINUSE") {
                    Monitor.error(`[HTTPS] [FATAL] [EADDRINUSE] Address is in use, cannot bind to port ${Config.getInstance().https.port}`);
                }
            });

            this.httpsServer = https;

            this.handleWebsocket(new WebSocket.Server({ server: https, path: WEBSOCKET_PATH }));

            https.listen(Config.getInstance().https.port, Config.getInstance().https.bindAddress, () => {
                Monitor.status(`[HTTPS] Application listening on ${Config.getInstance().https.bindAddress}:${Config.getInstance().https.port}`);

                // Setup certificates watcher
                const certificatesWatcher = new CertificatesWatcher(this);
                certificatesWatcher.start();
            });
        }
    }

    /**
     * Handle client request
     * @param req Request
     * @param res Response
     */
    private handle(req: HTTP.IncomingMessage, res: HTTP.ServerResponse) {
        try {
            decodeURI(req.url);
        } catch (ex) {
            res.writeHead(400);
            res.end("Invalid requested URL.");
            return;
        }
        this.application(req, res);
    }

    public async handleWebsocket(ws: WebSocket.Server) {
        ws.on("connection", function (socket: WebSocket.WebSocket, req: HTTP.IncomingMessage) {
            const manager: WebsocketController = new WebsocketController(socket, req);
            manager.start();
        }.bind(this));
    }

    /**
     * Registers the webhooks
     */
    private registerWebhooks() {
        // Webhooks here if needed
        if (FS.existsSync(Path.resolve(__dirname, "controllers", "webhooks"))) {
            const files = FS.readdirSync(Path.resolve(__dirname, "controllers", "webhooks"));
            for (const file of files) {
                if (file.endsWith(".js") || file.endsWith(".ts")) {
                    try {
                        const controllerModule = require(Path.resolve(__dirname, "controllers", "webhooks", file));
                        for (const key of Object.keys(controllerModule)) {
                            const controller = controllerModule[key];
                            if (controller && controller.prototype && typeof controller.prototype.register === "function") {
                                const instance: Controller = new controller();
                                instance.register(this.application);
                                Monitor.debug("Registered webhook: " + key);
                            }
                        }
                    } catch (ex) {
                        Monitor.exception(ex);
                    }
                }
            }
        }
    }

    /**
     * Registers the controllers.
     */
    private registerControllers() {
        const files = FS.readdirSync(Path.resolve(__dirname, "controllers"));
        for (const file of files) {
            if (file.endsWith(".js") || file.endsWith(".ts")) {
                try {
                    const controllerModule = require(Path.resolve(__dirname, "controllers", file));
                    for (const key of Object.keys(controllerModule)) {
                        const controller = controllerModule[key];
                        if (controller && controller.prototype && typeof controller.prototype.register === "function") {
                            const instance: Controller = new controller();
                            instance.register(this.application);
                            Monitor.debug("Registered controller: " + key);
                        }
                    }
                } catch (ex) {
                    Monitor.exception(ex);
                }
            }
        }
    }

    /**
     * Firewall. All requests go thought this method before being handled.
     * @param request The request object.
     * @param response The response object.
     * @param next The callback.
     */
    private firewall(request: Express.Request, response: Express.Response, next: () => void) {
        // Generate random request id
        const now = Date.now();
        const method = request.method.toUpperCase();
        const path = request.path;
        const ip = getRequestRemoteAddress(request);
        const requestSignature = method + " " + JSON.stringify(path) + " FOR " + ip;

        request.logger = new RequestLogger();

        request.logger.info("[START] " + requestSignature, {
            method: method,
            path: path,
            ip: ip,
        });

        if (request.logger.debug) {
            request.logger.debug("[HEADERS] " + JSON.stringify(request.headers));
            request.logger.debug("[QUERY] " + JSON.stringify(request.query));
        }

        response.once("finish", () => {
            const duration = Date.now() - now;
            request.logger.info("[FINISH] " + requestSignature, {
                method: method,
                path: path,
                ip: ip,
                statusCode: response.statusCode,
                duration: duration,
            });
        });

        if (request.protocol === "http" && Config.getInstance().redirectSecure && !request.path.startsWith("/.well-known/acme-challenge/")) {
            // Redirect to https
            response.writeHead(301, { Location: "https://" + request.headers.host + ":" + Config.getInstance().https.port + request.url });
            response.end();
            return;
        }

        next();
    }

    /**
     * Error handler. All requests that resulted in error go to this method.
     * @param error Error thrown.
     * @param request The request object.
     * @param response The response object.
     * @param next The callback.
     */
    private errorHandler(error: Error, request: Express.Request | any, response: Express.Response, next: () => any) {
        if (error) {
            Monitor.exception(error);
            response.status(INTERNAL_SERVER_ERROR);
            response.send("An internal server error ocurred. Check console for details.");
            return;
        }
        next();
    }

    /**
     * Adds middleware with error handling
     * @param mw Middleware
     */
    private addMiddleware(mw: any) {
        this.application.use((req: Express.Request, res: Express.Response, next: () => any) => {
            this.middlewareErrorHandler(mw, req, res, next);
        });
    }

    /**
     * Middleware error handler
     */
    private middlewareErrorHandler(mw: any, req: Express.Request, res: Express.Response, next: () => any) {
        mw(req, res, (err: Error) => {
            if (err) {
                Monitor.debugException(err);
                res.status(BAD_REQUEST);
                res.send(err.message);
                return;
            }

            next();
        });
    }

    /**
     * Starts a test server
     * @returns The port
     */
    public async startTest(): Promise<number> {
        return new Promise<number>((resolve, reject) => {
            try {
                const http = HTTP.createServer(this.handle.bind(this));

                this.handleWebsocket(new WebSocket.Server({ server: http, path: WEBSOCKET_PATH }));

                http.listen(0, '127.0.0.1', () => {
                    const port = (http.address() as AddressInfo).port;
                    Monitor.status(`[HTTP] Test application listening on 127.0.0.1:${port}`);
                    resolve(port);
                });
            } catch (ex) {
                reject(ex);
            }
        });
    }

    /**
     * Gracefully closes the server
     */
    public async close(): Promise<any> {
        const promises: Promise<void>[] = [];

        if (this.httpServer) {
            promises.push(new Promise((resolve) => {
                this.httpServer.close(err => {
                    if (err) {
                        Monitor.exception(err);
                    }

                    resolve();
                });
            }));
        }

        if (this.httpsServer) {
            promises.push(new Promise((resolve) => {
                this.httpsServer.close(err => {
                    if (err) {
                        Monitor.exception(err);
                    }

                    resolve();
                });
            }));
        }

        return Promise.all(promises);
    }
}

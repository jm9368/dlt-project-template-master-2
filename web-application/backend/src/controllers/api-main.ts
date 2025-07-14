// Reserved for license

"use strict";

import FS from "fs";
import Path from "path";
import Express from "express";
import { Config } from "../config/config";
import { NOT_FOUND } from "../utils/http-utils";
import { Controller } from "./controller";
import { Monitor } from "../monitor";

const API_PREFIX = "/api/v1";

/**
 * API (Version 1.0)
 */
export class ApiVersion1Controller extends Controller {
    public register(application: Express.Express): any {
        // Register API controllers
        const files = FS.readdirSync(Path.resolve(__dirname, "api"));
        for (const file of files) {
            if (file.endsWith(".js") || file.endsWith(".ts")) {
                try {
                    const controllerModule = require(Path.resolve(__dirname, "api", file));
                    for (const key of Object.keys(controllerModule)) {
                        const controller = controllerModule[key];
                        if (controller && controller.prototype && typeof controller.prototype.register === "function"){
                            const instance: Controller = new controller();
                            instance.registerAPI(API_PREFIX, application);
                            Monitor.debug("Registered API controller: " + key);
                        }
                    }
                } catch (ex) {
                    Monitor.exception(ex);
                }
            }
        }

        // Documentation
        if (Config.getInstance().serveSwaggerDocs) {
            application.get(API_PREFIX + "/", this.redirectToDoc.bind(this));
        }

        // Not found (default)
        application.all(API_PREFIX + "/*", this.notFound.bind(this));
    }

    public async redirectToDoc(request: Express.Request | any, response: Express.Response) {
        response.redirect("/api-docs");
    }

    public async notFound(request: Express.Request | any, response: Express.Response) {
        response.status(NOT_FOUND);
        response.json({ result: "error", code: "API_NOT_FOUND", message: "The requested URL does not match with any of the API endpoints." });
    }
}

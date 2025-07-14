// Reserved for license

"use strict";

import Express from "express";
import { Controller } from "./controller";
import Path from "path";
import { TEXT_HTML } from "../utils/http-utils";
import { readFile } from "fs";
import { Config } from "../config/config";
import { Monitor } from "../monitor";

const FRONTEND_INDEX_CACHE = "no-cache";

/**
 * Index controller
 */
export class IndexController extends Controller {
    private indexHTML: string;
    private indexCached: boolean;

    constructor() {
        super();

        this.indexHTML = "";
        this.indexCached = false;
    }

    private async getIndexHTML(): Promise<string> {
        if (this.indexCached) {
            return this.indexHTML;
        }

        const filePath = Path.resolve(Config.getInstance().frontendPath, "index.html");

        return new Promise<string>((resolve, reject) => {
            readFile(filePath, (err, data) => {
                if (err) {
                    return reject(err);
                }

                this.indexHTML = data.toString("utf-8");
                this.indexCached = true;

                resolve(this.indexHTML);
            });
        });
    }

    public register(application: Express.Express): any {
        // Serve index
        application.get("/", this.serveIndex.bind(this));
    }

    public async serveIndex(request: Express.Request, response: Express.Response) {
        if (!Config.getInstance().serveFrontend) {
            if (Config.getInstance().serveSwaggerDocs) {
                response.redirect("/api-docs");
            } else {
                response.send(Config.getInstance().appName + " " + Config.getInstance().appVersion);
            }
            return;
        }

        response.set("Cache-Control", FRONTEND_INDEX_CACHE);
        try {
            const html = await this.getIndexHTML();

            response.status(200);
            response.contentType(TEXT_HTML);
            response.send(html);
        } catch (ex) {
            Monitor.error("Could not load index.html. Error: " + ex.message);
            response.status(404);
            response.send("Not found");
        }
    }
}

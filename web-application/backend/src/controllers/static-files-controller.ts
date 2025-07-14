// Reserved for license

"use strict";

import Express from "express";
import { Controller } from "./controller";
import { contentType } from "mime-types";
import { FileStorageConfig } from "../config/config-file-storage";
import { FileStorageFileSystem } from "../services/file-storage-fs";
import { Monitor } from "../monitor";
import { FileStorageService } from "../services/file-storage";

const STATIC_FILES_CACHE = "max-age=31536000";

/**
 * Controller to serve static files
 */
export class StaticFilesController extends Controller {
    public register(application: Express.Express): any {
        // Serve index
        application.head("/static/*", this.serveFile.bind(this));
        application.get("/static/*", this.serveFile.bind(this));
    }

    public async serveFile(request: Express.Request, response: Express.Response) {
        const key = request.path.substring("/static/".length);

        let ext = "";

        if (key.includes(".")) {
            ext = key.split(".").pop();
        }

        // Check if enabled

        if (FileStorageConfig.getInstance().storageMode !== "fs") {
            response.status(404);
            response.send("Not Found.");
            return;
        }

        // Check permission

        if (!key.startsWith("public/")) {
            // Requires permission
            const authToken = (request.query.auth || "") + "";

            if (!authToken) {
                response.status(403);
                response.send("Access denied.");
                return;
            }

            const valid = FileStorageService.getInstance().verifyAuthToken(key, authToken);

            if (!valid) {
                response.status(403);
                response.send("Access denied.");
                return;
            }
        }

        let path: string;

        try {
            path = FileStorageFileSystem.getInstance().getFilePath(key);
        } catch (ex) {
            Monitor.debugException(ex);
            response.status(404);
            response.send("Not Found.");
            return;
        }

        response.setHeader("Cache-Control", STATIC_FILES_CACHE);
        response.setHeader("Content-Type", contentType(ext) || 'application/octet-stream');

        response.sendFile(path);
    }
}

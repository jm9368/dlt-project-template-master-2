// Reserved for license

"use strict";

import Express from "express";
import { URL } from "url";
import FileUpload from "express-fileupload";
import { Config } from "../config/config";

export const OK = 200;

export const BAD_REQUEST = 400;
export const UNAUTHORIZED = 401;
export const FORBIDDEN = 403;
export const NOT_FOUND = 404;

export const INTERNAL_SERVER_ERROR = 500;
export const NOT_IMPLEMENTED = 501;
export const SERVICE_UNAVAILABLE = 503;

export const TEXT_HTML = "text/html; charset=utf-8";
export const TEXT_PLAIN = "text/plain; charset=utf-8";
export const APPLICATION_JSON = "application/json; charset=utf-8";
export const APPLICATION_XML = "application/xml; charset=utf-8";
export const APPLICATION_BINARY_FILE = "application/octet-stream";

export const SUCCESS = "success";
export const ERROR = "error";

/**
 * Wraps the request handler, ensuring the response is marked for no-cache
 * @param callback The handler
 * @returns The wrapped handler
 */
export function noCache(callback: any) {
    return function (request: Express.Request | any, response: Express.Response) {
        response.setHeader("Cache-Control", "no-cache");
        return callback(request, response);
    };
}

/**
 * Wraps the request handler, ensuring the busy is always an object, and never null
 * @param callback The handler
 * @returns The wrapped handler
 */
export function ensureObjectBody(callback: any) {
    return function (request: Express.Request, response: Express.Response) {
        if (typeof request.body !== "object" || request.body === null) {
            request.body = Object.create(null);
        }

        if (request.logger && request.logger.levels.debug) {
            request.logger.debug("[BODY] " + JSON.stringify(request.body));

            if (request.files) {
                const filesMeta = Object.create(null);
                for (const fileKey of Object.keys(request.files)) {
                    const file = request.files[fileKey];

                    if (Array.isArray(file)) {
                        filesMeta[fileKey] = [];
                        for (const f of file) {
                            filesMeta[fileKey].push({
                                name: f.name,
                                size: f.size,
                                md5: f.md5,
                                mimetype: f.mimetype,
                            });
                        }
                    } else {
                        filesMeta[fileKey] = {
                            name: file.name,
                            size: file.size,
                            md5: file.md5,
                            mimetype: file.mimetype,
                        };
                    }
                }
                request.logger.debug("[FILES] " + JSON.stringify(filesMeta));
            }
        }

        return callback(request, response);
    };
}

/**
 * Resolves an URL
 * @param path The path
 * @param base The base URL
 * @returns The resolved URL
 */
export function resolveURL(path: string, base: string): string {
    return (new URL(path, base)).toString();
}

/**
 * Creates middleware to allow file upload
 * @param limitFileSize Custom file size limit. If not specified, the default is used from the configuration
 * @returns The middleware
 */
export function getFileUploadMiddleware(limitFileSize?: number) {
    return FileUpload({
        limits: { fileSize: limitFileSize || Config.getInstance().maxUploadFileSize },
    });
}

/**
 * Gets the API address from a request
 * @param request The request
 * @returns The IP address
 */
export function getRequestRemoteAddress(request: Express.Request): string {
    if (Config.getInstance().usingProxy) {
        return (request.headers["x-forwarded-for"] || request.socket.remoteAddress) + "";
    } else {
        return request.socket.remoteAddress + "";
    }
}

/**
 * Gets the user agent (Browser, OS) from the request
 * @param request The request
 * @param key The information you want to get from the use agent
 * @returns The information
 */
export function getUserAgentInfo(request: Express.Request, key: "os" | "browser"): string {
    if (!request.useragent) {
        return "";
    }
    switch (key) {
        case "os":
            return "" + request.useragent.platform + " / " + request.useragent.os;
        case "browser":
            return "" + request.useragent.browser + " / " + request.useragent.version;
        default:
            return "";
    }
}

/**
 * Sends Unauthorized (401) error to the client
 * @param request The request
 * @param response The response
 */
export function sendUnauthorized(request: Express.Request, response: Express.Response) {
    response.status(UNAUTHORIZED);
    response.end();
    if (request.logger.levels.debug) {
        request.logger.debug(`Client not authorized. Sent 401 (Unauthorized) to the client.`);
    }
}

/**
 * Sends error response to the client
 * @param request The request
 * @param response The response
 * @param statusCode The HTTP status code
 * @param errorCode The error code. The client will receive a JSON with a 'code' field 
 * @param reason The reason, for logging purposes
 */
export function sendApiError(request: Express.Request, response: Express.Response, statusCode: number, errorCode?: string, reason?: string) {
    response.status(statusCode);
    if (errorCode) {
        response.json({ code: errorCode });
    } else {
        response.end();
    }
    if (request.logger.levels.debug) {
        request.logger.debug(`Sent API error to the client. Status = ${statusCode}, Code = ${errorCode || "-"}. Reason: ${reason || "-"}`);
    }
}

/**
 * Sends API result to the client
 * @param request The request
 * @param response The response
 * @param result The result (to be converted to JSON)
 */
export function sendApiResult<T>(request: Express.Request, response: Express.Response, result: T) {
    response.status(OK);
    response.json(result);
    if (request.logger.levels.debug) {
        request.logger.debug(`Sent API result to the client: ${JSON.stringify(result)}`);
    }
}

/**
 * Sends success response to the client
 * Call when the request finishes successfully
 * @param request The request
 * @param response The response
 */
export function sendApiSuccess(request: Express.Request, response: Express.Response) {
    response.status(OK);
    response.end();
    if (request.logger.levels.debug) {
        request.logger.debug(`Sent 200 (Ok) to the client.`);
    }
}

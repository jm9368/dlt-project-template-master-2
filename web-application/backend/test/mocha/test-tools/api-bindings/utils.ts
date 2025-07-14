// API binding utilities

"use strict";

import { getServerStatus } from "../server-setup";

/**
 * API prefix
 */
export const API_PREFIX = "/api/v1";

/**
 * Gets full API URL from path
 * @param path The path
 * @returns The full API URL
 */
export function getApiUrl(path: string): string {
    const serverStatus = getServerStatus();
    return `http://127.0.0.1:${serverStatus.port}${API_PREFIX}${path}`;
}

/**
 * Generates query string for API
 * @param params The parameters
 * @returns The query string
 */
export function generateURIQuery(params: any): string {
    if (typeof params !== "object" || !params) {
        return "";
    }

    const keys = Object.keys(params);

    if (keys.length === 0) {
        return "";
    }

    let result = "";

    for (const key of keys) {
        if (params[key] === undefined || params[key] === null) {
            continue;
        }

        if (result !== "") {
            result += "&";
        } else {
            result += "?";
        }

        result += encodeURIComponent(key) + "=" + encodeURIComponent(params[key]);
    }

    return result;
}

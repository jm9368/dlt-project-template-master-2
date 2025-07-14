// API binding utilities

"use strict";

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
    if (import.meta.env.DEV) {
        const base = new URL(import.meta.env.VITE__DEV_TEST_HOST || "http://localhost", location.protocol + "//" + location.host).toString();
        return new URL(API_PREFIX + path, base).toString();
    } else {
        const base = new URL(import.meta.env.VITE__API_SERVER_HOST || "/", location.protocol + "//" + location.host).toString();
        return new URL(API_PREFIX + path, base).toString();
    }
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

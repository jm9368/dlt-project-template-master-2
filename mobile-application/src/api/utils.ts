// API binding utilities

"use strict";

import Constants from 'expo-constants';

/**
 * API server URL
 */
const API_SERVER_URL = Constants.expoConfig.extra.api_url || "http://10.0.2.2/api/v1";

/**
 * Gets full API URL from path
 * @param path The path
 * @returns The full API URL
 */
export function getApiUrl(path: string): string {
    return API_SERVER_URL + path;
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

/**
 * File to be uploaded via multipart/form-data
 */
export interface UploadableFile {
    /**
     * File URI
     */
    uri: string;
}

/**
 * Appends file to FormData
 * @param form The FormData instance
 * @param key The form key
 * @param file The uploadable file
 */
export function appendFileToForm(form: FormData, key: string, file: UploadableFile) {
    const localUri = file.uri;
    const filename = localUri.split('/').pop();
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : `image`;
    form.append(key, { uri: localUri, name: filename, type } as any);
}

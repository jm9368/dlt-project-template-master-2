// Frontend URL resolver

"use strict";

import Constants from "expo-constants";

const FRONTEND_URL = Constants.expoConfig.extra.frontend_base_url || "http://10.0.2.2:8080";

/**
 * Resolves frontend URL
 * @param path The path
 * @returns The full URL
 */
export function resolveFrontendURL(path: string): string {
    return new URL(path, FRONTEND_URL).toString();
}

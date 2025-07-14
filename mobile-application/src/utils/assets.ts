// Replaces localhost for emulator

"use strict";

import Constants from "expo-constants";

const LOCALHOST_IP = Constants.expoConfig.extra.emulator_localhost_ip || "http://10.0.2.2:8080";

/**
 * Fixes asset URL for emulator
 * @param url The URL
 * @returns The fixed URL
 */
export function fixAssetURL(url: string) {
    if (url.startsWith("http://localhost")) {
        return "http://" + LOCALHOST_IP + url.substring("http://localhost".length);
    } else if (url.startsWith("https://localhost")) {
        return "https://" + LOCALHOST_IP + url.substring("https://localhost".length);
    } else {
        return url;
    }
}

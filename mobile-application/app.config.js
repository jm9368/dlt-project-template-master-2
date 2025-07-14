// Configuration for EAS (Production)

"use strict";

const Path = require("path");
const FS = require("fs");

const localConfigFile = Path.resolve(__dirname, "app.json");

if (FS.existsSync(localConfigFile)) {
    module.exports = JSON.parse(FS.readFileSync(localConfigFile).toString());
} else {
    module.exports = {
        expo: {
            name: "mobile-application",
            slug: "mobile-application",
            owner: "air-dlt",
            version: "1.0.0",
            orientation: "portrait",
            icon: "./assets/icon.png",
            userInterfaceStyle: "light",
            splash: {
                image: "./assets/splash.png",
                resizeMode: "cover",
                backgroundColor: "#ffffff",
            },
            assetBundlePatterns: ["**/*"],
            ios: {
                supportsTablet: true,
                bundleIdentifier: "hyperlender-mobile-app",
                buildNumber: "1",
            },
            android: {
                adaptiveIcon: {
                    foregroundImage: "./assets/adaptive-icon.png",
                    backgroundColor: "#ffffff",
                },
                windowSoftInputMode: "adjustResize",
                package: "com.air.hyperlender",
            },
            web: {
                favicon: "./assets/favicon.png",
            },
            extra: {
                eas: {
                    projectId: "",
                },
                platform_name: "Platform",
                always_show_initial_screen: false,
                api_url: "http://10.0.2.2/api/v1",
                frontend_base_url: "http://10.0.2.2:8080",
                emulator_localhost_ip: "10.0.2.2",
                reCaptchaKey: "",
            },
        },
    };
}

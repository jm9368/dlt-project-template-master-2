// Vue entry point

"use strict";

import { AuthController } from "./control/auth";
import { WalletsController } from "./control/wallets";

// Initialize stuff

AuthController.Initialize();
WalletsController.Initialize();

// Global event handlers

document.addEventListener("drop", function (e) {
    e.preventDefault();
    e.stopPropagation();
});

document.addEventListener("dragover", function (e) {
    e.preventDefault();
    e.stopPropagation();
});

import { createApp } from "vue";

import { i18n } from "./i18n";
import { appEventsPlugin } from "./app-events-plugin";
import { makeApplicationRouter } from "./routes";

import App from "./App.vue";
import ModalDialogContainer from "@/components/utils/ModalDialogContainer.vue";

/**
 * Main entry point
 */
async function main() {
    // Setup App
    const app = createApp(App);

    app.use(i18n); // Multi-language

    app.use(appEventsPlugin); // Events plugin

    app.use(makeApplicationRouter()); // Router

    // reCaptcha
    if (import.meta.env.VITE__CAPTCHA_SERVICE === "reCAPTCHA") {
        const VueReCaptcha = (await import("vue-recaptcha-v3")).VueReCaptcha;
        app.use(VueReCaptcha, { siteKey: import.meta.env.VITE__RECAPTCHA_SITE_KEY || "", loaderOptions: { autoHideBadge: true } });
    }

    // Global components

    app.component("ModalDialogContainer", ModalDialogContainer);

    // Mount app

    app.mount("#app");

    // Add listener for reload

    window.addEventListener("vite:preloadError", () => {
        window.location.reload();
    });
}

main();

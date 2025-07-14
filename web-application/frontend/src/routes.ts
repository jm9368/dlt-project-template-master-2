// Routes

"use strict";

import { createRouter, createWebHistory, Router, RouteRecordRaw } from "vue-router";
import { Timeouts } from "./utils/timeout";
import { AppEvents } from "./control/app-events";

// Router
// https://router.vuejs.org/guide/#javascript

// List of forbidden routes:
//
//    - /api/*  - This is reserved for the API
//    - /static/* - This is reserved for static assets
//    - /webhooks*/ - Reserved for webhooks

const routes: (RouteRecordRaw & {
    meta?: {
        /**
         * Set it to true for sticky sidebar
         */
        sidebarSticky?: boolean;
    };
})[] = [
    /* General / Home */

    {
        name: "home",
        path: "/",
        component: () => import("@/components/routes/HomePage.vue"),
        meta: {
            sidebarSticky: true,
        },
    },

    {
        name: "about",
        path: "/about",
        component: () => import("@/components/routes/AboutPage.vue"),
        meta: {
            sidebarSticky: true,
        },
    },

    {
        name: "terms",
        path: "/terms",
        component: () => import("@/components/routes/TermsOfUsePage.vue"),
        meta: {
            sidebarSticky: true,
        },
    },

    {
        name: "cookies",
        path: "/cookies",
        component: () => import("@/components/routes/CookiePolicyPage.vue"),
        meta: {
            sidebarSticky: true,
        },
    },

    {
        name: "privacy",
        path: "/privacy",
        component: () => import("@/components/routes/PrivacyPolicyPage.vue"),
        meta: {
            sidebarSticky: true,
        },
    },

    /* Auth */

    {
        name: "login",
        path: "/login",
        component: () => import("@/components/routes/auth/LoginPage.vue"),
    },

    {
        name: "tfa-login",
        path: "/login/tfa",
        component: () => import("@/components/routes/auth/TwoFactorLoginPage.vue"),
    },

    {
        name: "signup",
        path: "/signup",
        component: () => import("@/components/routes/auth/SignupPage.vue"),
    },
    {
        name: "signup-success",
        path: "/signup/success",
        component: () => import("@/components/routes/auth/SignupSuccessPage.vue"),
    },

    {
        name: "forgot-password",
        path: "/password/forgot",
        component: () => import("@/components/routes/auth/ForgotPasswordPage.vue"),
    },
    {
        name: "reset-password",
        path: "/password/reset/:uid/:token",
        component: () => import("@/components/routes/auth/ResetPasswordPage.vue"),
    },

    {
        name: "verify-email",
        path: "/email/verify/:uid/:token",
        component: () => import("@/components/routes/auth/EmailVerifyPage.vue"),
    },

    {
        name: "tp-login",
        path: "/login/tp/:service",
        component: () => import("@/components/routes/auth/ThirdPartyLogin.vue"),
    },

    {
        name: "tp-signup",
        path: "/signup/tp",
        component: () => import("@/components/routes/auth/ThirdPartySignupPage.vue"),
    },

    /* Profile */

    {
        name: "profile",
        path: "/user/:username",
        component: () => import("@/components/routes/profile/ProfilePage.vue"),
    },

    /* Account */

    {
        name: "account-settings",
        path: "/account-settings",
        component: () => import("@/components/routes/account/AccountSettingsPage.vue"),
    },

    /* Wallet */

    {
        name: "wallet",
        path: "/wallet/:id",
        component: () => import("@/components/routes/wallet/WalletSettingsPage.vue"),
    },

    /* Admin */

    {
        name: "admin",
        path: "/admin",
        component: () => import("@/components/routes/admin/AdministrationPage.vue"),
    },

    {
        name: "admin-user",
        path: "/admin/users/:id",
        component: () => import("@/components/routes/admin/UserPage.vue"),
    },

    /* Default */

    {
        path: "/:catchAll(.*)",
        component: () => import("@/components/routes/NotFoundPage.vue"),
    },
];

export function makeApplicationRouter(): Router {
    const router = createRouter({
        // 4. Provide the history implementation to use. We are using the hash history for simplicity here.
        history: createWebHistory(),
        routes, // short for `routes: routes`
    });

    router.beforeEach(() => {
        Timeouts.Set("router-load-state", 300, () => {
            AppEvents.Emit("router-load-state-change", true);
        });
    });

    router.afterEach(() => {
        Timeouts.Abort("router-load-state");
        AppEvents.Emit("router-load-state-change", false);
    });

    return router;
}

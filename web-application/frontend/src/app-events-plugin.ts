// Plugin for global events and other custom methods

"use strict";

import { App, nextTick } from "vue";
import { AppEvents, AppEventsMap } from "./control/app-events";
import { AuthController } from "./control/auth";
import { clone } from "./utils/objects";

/**
 * Home route name
 */
export const HOME_ROUTE = "home";

/**
 * List of routes that can only be accessed when unauthorized
 */
export const UNAUTHORIZED_ONLY_ROUTES = [
    "login",
    "signup",
    "signup-success",
    "tfa-login",
    "forgot-password",
    "reset-password",
    "verify-email",
    "tp-login",
    "tp-signup",
];

type CallbackFunctionVariadic = (...args: any[]) => void;

declare module "@vue/runtime-core" {
    interface ComponentCustomProperties {
        /**
         * Override refs
         */
        $refs: any;

        /**
         * Mapping of app event handlers
         */
        $appEventHandlers: Map<string, CallbackFunctionVariadic>;

        /**
         * Mapping of document event handlers
         */
        $documentEventHandlers: Map<string, CallbackFunctionVariadic>;

        /**
         * Listens to a global custom App event, and removes the listener after the component has been removed
         * @param eventName Event name
         * @param handler Event handler function
         */
        $listenOnAppEvent: <K extends keyof AppEventsMap>(eventName: K, handler: AppEventsMap[K]) => void;

        /**
         * Listens to a document
         * @param eventName Event name
         * @param handler Event handler function
         */
        $listenOnDocumentEvent: <K extends keyof DocumentEventMap>(
            eventName: K,
            listener: (this: Document, ev: DocumentEventMap[K]) => any,
        ) => void;

        /**
         * Closes the current modal, if the component has a 'modalContainer' reference
         * @param forced True to ignore the close callback
         */
        $closeModal: (forced?: boolean) => void;

        /**
         * Automatically focus an element
         * @param className The class of the element. By default, auto-focus
         */
        $autoFocus: (className?: string) => void;

        /**
         * Call on authorized to request the user to login
         */
        $requireLogin: () => void;

        /**
         * Redirects to the page where the login was required
         */
        $goBackFromLogin: () => void;

        /**
         * The title of the page
         */
        $subTitle?: string;

        /**
         * Set sub-title for pages
         * @param title The title to set
         */
        $setSubTitle: (title: string) => void;

        /**
         * Displays a message in the Stack Bar
         * @param msg The message
         * @param position The position of the snackbar
         */
        $showSnackBar: (msg: string, position?: "left" | "center" | "right") => void;

        /**
         * Show a message modal
         * @param title The title
         * @param msg The message
         */
        $showMessageModal: (title: string, msg: string) => void;

        /**
         * Shows a profile modal
         * @param uid The user ID
         */
        $showProfileModal: (uid: string) => void;

        /**
         * Asks for user confirmation
         * @param options The options
         */
        $askUserConfirmation: (options: { title: string; message: string; danger?: boolean; callback: () => void }) => void;

        /**
         * Gets a captcha
         * @param subject The subject
         * @returns The captcha (as a promise that never rejects)
         */
        $getCaptcha: (subject: string) => Promise<string>;
    }
}

const PLATFORM_NAME = import.meta.env.VITE__PLATFORM_NAME;

export const appEventsPlugin = {
    install: (app: App) => {
        app.mixin({
            methods: {
                $listenOnAppEvent: function <K extends keyof AppEventsMap>(eventName: K, handler: AppEventsMap[K]) {
                    if (!this.$appEventHandlers) {
                        this.$appEventHandlers = new Map();
                    }
                    if (this.$appEventHandlers.has(eventName)) {
                        throw new Error("Already listening for app event '" + eventName + "' on this component");
                    }
                    this.$appEventHandlers.set(eventName, handler);
                    AppEvents.AddEventListener(eventName, handler);
                },
                $listenOnDocumentEvent: function <K extends keyof DocumentEventMap>(
                    eventName: K,
                    listener: (this: Document, ev: DocumentEventMap[K]) => any,
                ) {
                    if (!this.$documentEventHandlers) {
                        this.$documentEventHandlers = new Map();
                    }
                    if (this.$documentEventHandlers.has(eventName)) {
                        throw new Error("Already listening for document event '" + eventName + "' on this component");
                    }
                    this.$documentEventHandlers.set(eventName, listener);
                    document.addEventListener(eventName, listener);
                },
                $closeModal: function (forced?: boolean) {
                    const modalContainer = this.$refs.modalContainer;
                    modalContainer && modalContainer.close && modalContainer.close(forced);
                },
                $autoFocus: function (className?: string) {
                    nextTick(() => {
                        if (!this.$el) {
                            return;
                        }
                        const elem = this.$el.querySelector("." + (className || "auto-focus"));
                        if (elem) {
                            elem.focus();
                            elem.select && typeof elem.select === "function" && elem.select();
                        } else {
                            this.$el.focus();
                        }
                    });
                },
                $requireLogin: function () {
                    if (this.$requiredLogin) {
                        return;
                    }

                    this.$requiredLogin = true;
                    AuthController.ClearSession();

                    const goBackRoute = this.$route
                        ? {
                              name: this.$route.name,
                              params: clone(this.$route.params),
                              query: clone(this.$route.query),
                          }
                        : { name: HOME_ROUTE };

                    if (!UNAUTHORIZED_ONLY_ROUTES.includes(goBackRoute.name)) {
                        // If the user is in a page outside the login/registry flow, save it to go back after login
                        AuthController.PageToGo = goBackRoute;
                    }

                    this.$closeModal(true);

                    if (goBackRoute.name !== "login") {
                        this.$router.push({ name: "login" });
                    }

                    this.$requiredLogin = false;
                },
                $goBackFromLogin: function () {
                    this.$router.push({
                        name: AuthController.PageToGo.name,
                        params: AuthController.PageToGo.params,
                        query: AuthController.PageToGo.query,
                    });
                },
                $setSubTitle: function (title: string) {
                    this.$subTitle = title;
                    document.title = title + " | " + PLATFORM_NAME;
                },

                $showSnackBar: function (msg: string, position?: "left" | "center" | "right") {
                    AppEvents.Emit("snack", msg, position);
                },

                $showMessageModal: function (title: string, msg: string) {
                    AppEvents.Emit("msg-modal", title, msg);
                },

                $askUserConfirmation: function (options: { title: string; message: string; danger?: boolean; callback: () => void }) {
                    AppEvents.Emit("ask-confirmation", options);
                },

                $showProfileModal: function (uid: string) {
                    AppEvents.Emit("show-profile", uid);
                },

                $getCaptcha: async function (subject: string): Promise<string> {
                    try {
                        switch (import.meta.env.VITE__CAPTCHA_SERVICE) {
                            case "reCAPTCHA": {
                                await this.$recaptchaLoaded();
                                const token = await this.$recaptcha(subject);
                                return token;
                            }
                            default:
                                return "";
                        }
                    } catch (ex) {
                        console.error(ex);
                        return "";
                    }
                },
            },
            beforeUnmount() {
                if (this.$subTitle) {
                    document.title = PLATFORM_NAME;
                }
                this.$appEventHandlers &&
                    this.$appEventHandlers.forEach((handler, eventName) => {
                        AppEvents.RemoveEventListener(eventName, handler);
                    });
                this.$documentEventHandlers &&
                    this.$documentEventHandlers.forEach((listener, eventName) => {
                        document.removeEventListener(eventName, listener);
                    });
            },
        });
    },
};

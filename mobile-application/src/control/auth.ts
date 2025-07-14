// Auth controller

import { Request, addRequestAuthenticationHandler } from "@asanrom/request-browser";
import { Timeouts } from "../utils/timeout";
import { AppEvents } from "./app-events";
import { LocalStorage } from "./local-storage";
import { ApiAuth } from "../api/api-group-auth";

const SESSION_TOKEN_HEADER_NAME = "x-session-id";

export type AuthStatus = "UNAUTHORIZED" | "LOGGED_IN" | "USER_NOT_FOUND" | "TFA_REQUIRED";

export class AuthController {
    public static Status: AuthStatus = "UNAUTHORIZED";

    public static UID = "";
    public static Role = "";
    public static Permissions = [];
    public static Username = "";
    public static Email = "";

    public static PageToGo = "home";
    public static PageToGoParams = {};

    public static RequiresTwoFactorAuthentication = false;

    public static Session = "";

    public static Locale = "";

    public static ProfileName = "";
    public static ProfileImage = "";

    public static Loading = true;

    public static FirstTimeLoaded = false;

    public static Initialize() {
        addRequestAuthenticationHandler(() => {
            const authHeaders = Object.create(null);
            authHeaders[SESSION_TOKEN_HEADER_NAME] = AuthController.Session;

            return authHeaders;
        });

        AuthController.Session = LocalStorage.Get("x-session-token", "");
        AuthController.CheckAuthStatus();
        AppEvents.AddEventListener("unauthorized", AuthController.ClearSession);
    }

    public static isAuthenticated(): boolean {
        return AuthController.Status === "LOGGED_IN";
    }

    public static isAskingForTwoFactor(): boolean {
        return AuthController.Status === "TFA_REQUIRED";
    }

    public static hasPermission(permission: string): boolean {
        return AuthController.Permissions.includes(permission);
    }

    public static CheckAuthStatus() {
        AuthController.Loading = true;
        AppEvents.Emit("auth-status-loading", true);
        Timeouts.Abort("auth-control-check");
        Request.Pending("auth-control-check", ApiAuth.GetContext())
            .onSuccess(response => {
                AuthController.Status = response.status;
                AuthController.UID = response.uid;
                AuthController.Role = response.role;
                AuthController.Permissions = response.permissions.slice();
                AuthController.Username = response.username;
                AuthController.Email = response.email;
                AuthController.RequiresTwoFactorAuthentication = response.tfa;
                AuthController.Loading = false;
                AuthController.ProfileName = response.profileName;
                AuthController.ProfileImage = response.profileImage;
                AuthController.Locale = response.locale;
                AuthController.FirstTimeLoaded = true;
                AppEvents.Emit("auth-status-changed");
                AppEvents.Emit("auth-status-loading", false);
            })
            .onRequestError((err, handleErr) => {
                handleErr(err, {
                    unauthorized: () => {
                        AuthController.Status = "UNAUTHORIZED";
                        AuthController.UID = "";
                        AuthController.Username = "";
                        AuthController.Loading = false;
                        AppEvents.Emit("auth-status-changed");
                        AppEvents.Emit("auth-status-loading", false);
                    },
                    temporalError: () => {
                        // Retry
                        Timeouts.Set("auth-control-check", 1500, AuthController.CheckAuthStatus);
                    },
                });
            })
            .onUnexpectedError(err => {
                console.error(err);
                // We assume the credentials are invalid
                AuthController.Status = "UNAUTHORIZED";
                AuthController.UID = "";
                AuthController.Username = "";
                AuthController.Loading = false;
                AppEvents.Emit("auth-status-changed");
                AppEvents.Emit("auth-status-loading", false);
            });
    }

    public static ClearSession() {
        AuthController.Status = "UNAUTHORIZED";
        AuthController.Session = "";

        LocalStorage.Set("x-session-token", "");

        AuthController.UID = "";
        AuthController.Username = "";

        AppEvents.Emit("auth-status-changed");
    }

    public static SetSession(session: string) {
        AuthController.Status = "UNAUTHORIZED";
        AuthController.Session = session;
        AuthController.UID = "";
        AuthController.Username = "";
        LocalStorage.Set("x-session-token", session);
        AppEvents.Emit("auth-status-changed");
        AuthController.CheckAuthStatus();
    }

    public static Logout(): Promise<void> {
        const currentSession = AuthController.Session;
        return new Promise<void>(resolve => {
            Request.Do(ApiAuth.Logout())
                .onSuccess(() => {
                    if (AuthController.Session === currentSession) {
                        AuthController.ClearSession();
                    }
                    resolve();
                })
                .onRequestError(() => {
                    if (AuthController.Session === currentSession) {
                        AuthController.ClearSession();
                    }
                    resolve();
                })
                .onUnexpectedError(err => {
                    console.error(err);
                    if (AuthController.Session === currentSession) {
                        AuthController.ClearSession();
                    }
                    resolve();
                });
        });
    }
}

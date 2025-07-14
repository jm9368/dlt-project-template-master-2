// Authentication hook

"use strict";

import { useCallback, useEffect, useState } from "react";
import { AuthController } from "../control/auth";
import { AppEvents } from "../control/app-events";

/**
 * Authentication hook result
 */
interface AuthHookResult {
    /**
     * True if loading
     */
    loading: boolean;

    /**
     * True if authenticated
     */
    authenticated: boolean;

    /**
     * Session token
     */
    session: string;

    /**
     * True if asking for two factor authentication
     */
    askingForTFA: boolean;

    /**
     * Current User ID
     */
    uid: string;

    /**
     * Current user role
     */
    role: string;

    /**
     * Current username
     */
    username: string;

    /**
     * Current email
     */
    email: string;

    /**
     * True if the user has TFA enabled
     */
    tfaEnabled: boolean;

    /**
     * Checks if the user has a permission (for the API)
     * @param permission The permission
     * @returns True if the user has the permission
     */
    hasPermission: (permission: string) => boolean;

    /**
     * Profile name
     */
    profileName: string;

    /**
     * Profile image
     */
    profileImage: string;

    /**
     * User locale
     */
    userLocale: string;
}

/**
 * Hook to get authentication data
 * @returns All the authentication variables
 */
export const useAuth: () => AuthHookResult = () => {
    const [loading, setLoading] = useState(AuthController.Loading);
    const [authenticated, setAuthenticated] = useState(AuthController.isAuthenticated());
    const [session, setSession] = useState(AuthController.Session);
    const [askingForTFA, setAskingForTFA] = useState(AuthController.isAskingForTwoFactor());

    const [uid, setUID] = useState(AuthController.UID);
    const [role, setRole] = useState(AuthController.Role);
    const [username, setUsername] = useState(AuthController.Username);
    const [email, setEmail] = useState(AuthController.Email);

    const [tfaEnabled, setTfaEnabled] = useState(AuthController.RequiresTwoFactorAuthentication);

    const [profileName, setProfileName] = useState(AuthController.ProfileName);
    const [profileImage, setProfileImage] = useState(AuthController.ProfileImage);
    const [userLocale, setUserLocale] = useState(AuthController.Locale);

    const [permissions, setPermissions] = useState(AuthController.Permissions.slice());

    const hasPermission = useCallback(
        (permission: string) => {
            return AuthController.hasPermission(permission);
        },
        [permissions],
    );

    const onAuthLoadingChanged = (l: boolean) => {
        setLoading(l);
    };

    const onAuthChanged = () => {
        setAuthenticated(AuthController.isAuthenticated());
        setSession(AuthController.Session);
        setAskingForTFA(AuthController.isAskingForTwoFactor());
        setUID(AuthController.UID);
        setRole(AuthController.Role);
        setUsername(AuthController.Username);
        setEmail(AuthController.Email);
        setTfaEnabled(AuthController.RequiresTwoFactorAuthentication);
        setProfileName(AuthController.ProfileName);
        setProfileImage(AuthController.ProfileImage);
        setUserLocale(AuthController.Locale);
        setPermissions(AuthController.Permissions.slice());
    };

    useEffect(() => {
        AppEvents.AddEventListener("auth-status-changed", onAuthChanged);
        AppEvents.AddEventListener("auth-status-loading", onAuthLoadingChanged);

        return () => {
            AppEvents.RemoveEventListener("auth-status-changed", onAuthChanged);
            AppEvents.AddEventListener("auth-status-loading", onAuthLoadingChanged);
        };
    }, []);

    return {
        loading,
        authenticated,
        session,
        askingForTFA,
        uid,
        role,
        username,
        email,
        tfaEnabled,
        profileName,
        profileImage,
        userLocale,
        hasPermission,
    };
};

// Reserved for license

"use strict";

import Express from "express";
import { Config } from "../config/config";
import { Session } from "../models/users/session";
import { User } from "../models/users/user";
import { Monitor } from "../monitor";
import { ResetPasswordEmailView } from "../emails/reset.password.email.view";
import { VerificationEmailView } from "../emails/verification.email.view";
import { MailService } from "./mail-service";
import { UserSystemConfig } from "../config/config-users";
import { GlobalPermission, UserRole } from "../models/users/user-role";
import { RedisService } from "./redis-service";
import { UserProfile } from "../models/users/user-profile";

/**
 * Administrator role
 */
export const ADMIN_ROLE = "admin";

/**
 * Authentication context
 */
export class AuthContext {
    public session: Session;

    /**
     * User ID
     */
    public uid: string;

    public user: User;
    public role: UserRole;

    public permissions: GlobalPermission[];

    constructor() {
        this.session = null;
        this.uid = null;
        this.user = null;
        this.role = null;
        this.permissions = [];
    }

    /**
     * Checks if it's authenticated
     */
    public isAuthenticated() {
        return !!this.uid;
    }

    /**
     * Checks if it's a registered user
     */
    public isRegisteredUser() {
        return !!this.user;
    }

    /**
     * Checks if the user has a permission
     * @param permission The permission
     * @returns True if the user has the permission
     */
    public hasPermission(permission: GlobalPermission): boolean {
        if (this.user && this.user.role === ADMIN_ROLE) {
            return true; // Administrator have all the permissions
        }

        return this.permissions.includes(permission);
    }
}

/**
 * Minified user profile information
 * Use to show in list
 */
export interface UserProfileMin {
    /**
     * User ID
     */
    id: string;

    /**
     * Username
     */
    username: string;

    /**
     * User profile name
     */
    name: string;

    /**
     * User profile image
     */
    image: string;
}

/**
 * Time to cache user min profile (seconds)
 */
const MIN_PROFILE_CACHE_TIME_SECONDS = 24 * 60 * 60;

/**
 * Users auth service
 */
export class UsersService {
    /* Singleton */

    public static instance: UsersService = null;

    public static getInstance(): UsersService {
        if (UsersService.instance !== null) {
            return UsersService.instance;
        } else {
            UsersService.instance = new UsersService();
            return UsersService.instance;
        }
    }

    constructor() {

    }

    /**
     * Initializes users system
     */
    public async initialize() {
        const forcedAdmin = UserSystemConfig.getInstance().forceUserAdmin;

        if (forcedAdmin) {
            const foundUser = await User.findUserByUsername(forcedAdmin);

            if (foundUser) {
                foundUser.role = ADMIN_ROLE;
                await foundUser.save();
            }
        }

        const userCount = await User.countAll();

        if (userCount === 0 && UserSystemConfig.getInstance().initialUserName) {
            const initialUser = await User.registerConfiguredAdministrator(UserSystemConfig.getInstance().initialUserName + "@localhost", UserSystemConfig.getInstance().initialUserName, UserSystemConfig.getInstance().initialUserPassword);
            Monitor.info(`Registered initial user @${initialUser.username} with id=${initialUser.id}`);
        }
    }

    /**
     * Parses the request to find the session.
     * @param request The request.
     */
    public async session(request: Express.Request, ignoreTFA?: boolean): Promise<Session> {
        return Session.fromRequest(request, ignoreTFA);
    }

    /**
     * Gets authentication context
     * @param request Request
     * @returns The auth context
     */
    public async auth(request: Express.Request): Promise<AuthContext> {
        const result = new AuthContext();
        const session = await Session.fromRequest(request);
        if (session) {
            // Registered user
            result.session = session;
            result.user = await session.findUser();
            if (result.user) {
                result.uid = result.user.id;

                if (request.logger.levels.debug) {
                    request.logger.debug('[AUTH] Authorized. User: ' + result.user.username, {userId: result.user.id, username: result.user.username});
                }

                if (result.user.role !== ADMIN_ROLE) {
                    const role = await UserRole.finder.findByKey(result.user.role);

                    if (role) {
                        result.permissions = role.getPermissionsList() as GlobalPermission[];
                    }
                }
            } else {
                request.logger.debug('[AUTH] Unauthorized: User deleted');
            }
        } else {
            request.logger.debug('[AUTH] Unauthorized: No session');
        }
        return result;
    }

    /**
     * Get minified user profile info
     * @param uid The user ID
     * @returns The profile info
     */
    public async getMinifiedUserProfile(uid: string): Promise<UserProfileMin> {
        if (!uid) {
            return {
                id: uid,
                username: "",
                name: "",
                image: "",
            };
        }

        const cacheKey = "profile:uid:" + uid;

        const cachedProfile = await RedisService.getInstance().getFromCache(cacheKey);

        if (cachedProfile) {
            try {
                return JSON.parse(cachedProfile);
            } catch (ex) {
                Monitor.exception(ex);
            }
        }

        // Not cached, read from database

        const user = await User.findUserByUID(uid);

        if (!user) {
            return {
                id: uid,
                username: "",
                name: "",
                image: "",
            };
        }

        const profile = await UserProfile.findByUser(user.id);

        if (!profile) {
            return {
                id: uid,
                username: user.username,
                name: "",
                image: "",
            };
        }

        const minProfile = {
            id: uid,
            username: user.username,
            name: profile.name,
            image: profile.image,
        };

        await RedisService.getInstance().setCache(cacheKey, JSON.stringify(minProfile), MIN_PROFILE_CACHE_TIME_SECONDS);

        return minProfile;
    }

    /**
     * Clears profile info from cache
     * @param uid The user ID
     */
    public clearProfileCache(uid: string): Promise<void> {
        const cacheKey = "profile:uid:" + uid;

        return RedisService.getInstance().delCache(cacheKey);
    }

    /**
     * Sends verification email
     * @param user The user
     * @param request The request
     */
    public async sendVerificationEmail(user: User, request?: Express.Request) {
        const url = Config.getInstance().getFrontendURI("/email/verify/" + encodeURIComponent(user.id) + "/" + encodeURIComponent(user.emailVerificationCode));
        Monitor.debug("Sending verification email to: " + user.email);
        try {
            await MailService.getInstance().sendMail(
                user.email,
                VerificationEmailView.getSubject(request, user),
                VerificationEmailView.renderText(request, user, url),
                VerificationEmailView.render(request, user, url)
            );
            Monitor.debug(`Verification email sent to ${user.email}`);
        } catch (e) {
            Monitor.error("Could not send verification email: " + e.message);
            throw e;
        }
    }

    /**
     * Sends verification email (for email change)
     * @param user The user
     * @param request The request
     */
    public async sendVerificationChangeEmail(user: User, request?: Express.Request) {
        const url = Config.getInstance().getFrontendURI("/email/verify/" + encodeURIComponent(user.id) + "/" + encodeURIComponent(user.emailVerificationCode));
        Monitor.debug("Sending verification email to: " + user.emailRequest);
        try {
            await MailService.getInstance().sendMail(
                user.emailRequest,
                VerificationEmailView.getSubject(request, user),
                VerificationEmailView.renderText(request, user, url),
                VerificationEmailView.render(request, user, url)
            );
            Monitor.debug(`Verification email sent to ${user.emailRequest}`);
        } catch (e) {
            Monitor.error("Could not send verification email: " + e.message);
            throw e;
        }
    }

    /**
     * Sends password reset email
     * @param user The user
     * @param request The request
     */
    public async sendResetPasswordEmail(user: User, request?: Express.Request) {
        const url = Config.getInstance().getFrontendURI("/password/reset/" + encodeURIComponent(user.id) + "/" + encodeURIComponent(user.passwordResetCode));
        Monitor.debug("Sending reset password email to: " + user.email);
        try {
            await MailService.getInstance().sendMail(
                user.email,
                ResetPasswordEmailView.getSubject(request, user),
                ResetPasswordEmailView.renderText(request, user, url),
                ResetPasswordEmailView.render(request, user, url)
            );
            Monitor.debug(`Password reset email sent to ${user.email}`);
        } catch (e) {
            Monitor.error("Could not send password reset email: " + e.message);
            throw e;
        }
    }
}


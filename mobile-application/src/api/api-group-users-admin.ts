// API bindings: users_admin (Auto generated)

"use strict";

import { RequestErrorHandler, RequestParams, CommonAuthenticatedErrorHandler } from "@asanrom/request-browser";
import { getApiUrl, generateURIQuery } from "./utils";
import { UserAdminList, UserAdminDetails, AdminSetRoleBody, UserAdminEmailChange, UserAdminUsernameChange, UserAdminPasswordChange } from "./definitions";

export class ApiUsersAdmin {
    /**
     * Method: GET
     * Path: /admin/users
     * Gets list of users
     * Requires permission: mod.users
     * @param queryParams Query parameters
     * @returns The request parameters
     */
    public static GetUsers(queryParams: GetUsersQueryParameters): RequestParams<UserAdminList, GetUsersErrorHandler> {
        return {
            method: "GET",
            url: getApiUrl(`/admin/users` + generateURIQuery({ ...queryParams, _time: Date.now() })),
            handleError: (err, handler) => {
                new RequestErrorHandler()
                    .add(403, "*", handler.forbidden)
                    .add(401, "*", handler.unauthorized)
                    .add(500, "*", "serverError" in handler ? handler.serverError : handler.temporalError)
                    .add("*", "*", "networkError" in handler ? handler.networkError : handler.temporalError)
                    .handle(err);
            },
        };
    }

    /**
     * Method: GET
     * Path: /admin/users/{id}
     * Gets details of an user
     * Requires permission: mod.users
     * @param id User ID
     * @returns The request parameters
     */
    public static GetUser(id: string): RequestParams<UserAdminDetails, GetUserErrorHandler> {
        return {
            method: "GET",
            url: getApiUrl(`/admin/users/${encodeURIComponent(id)}` + generateURIQuery({ _time: Date.now() })),
            handleError: (err, handler) => {
                new RequestErrorHandler()
                    .add(404, "*", handler.notFound)
                    .add(403, "*", handler.forbidden)
                    .add(401, "*", handler.unauthorized)
                    .add(500, "*", "serverError" in handler ? handler.serverError : handler.temporalError)
                    .add("*", "*", "networkError" in handler ? handler.networkError : handler.temporalError)
                    .handle(err);
            },
        };
    }

    /**
     * Method: POST
     * Path: /admin/users/{id}/role
     * Sets the role of an user
     * Requires permission: admin.roles
     * @param id User ID
     * @param body Body parameters
     * @returns The request parameters
     */
    public static SetRole(id: string, body: AdminSetRoleBody): RequestParams<void, SetRoleErrorHandler> {
        return {
            method: "POST",
            url: getApiUrl(`/admin/users/${encodeURIComponent(id)}/role` + generateURIQuery({ _time: Date.now() })),
            json: body,
            handleError: (err, handler) => {
                new RequestErrorHandler()
                    .add(404, "*", handler.notFound)
                    .add(403, "*", handler.forbidden)
                    .add(400, "INVALID_ROLE", handler.badRequestInvalidRole)
                    .add(400, "SELF", handler.badRequestSelf)
                    .add(400, "*", handler.badRequest)
                    .add(401, "*", handler.unauthorized)
                    .add(500, "*", "serverError" in handler ? handler.serverError : handler.temporalError)
                    .add("*", "*", "networkError" in handler ? handler.networkError : handler.temporalError)
                    .handle(err);
            },
        };
    }

    /**
     * Method: POST
     * Path: /admin/users/{id}/ban
     * Bans an user
     * Requires permission: mod.ban
     * @param id User ID
     * @returns The request parameters
     */
    public static Ban(id: string): RequestParams<void, BanErrorHandler> {
        return {
            method: "POST",
            url: getApiUrl(`/admin/users/${encodeURIComponent(id)}/ban` + generateURIQuery({ _time: Date.now() })),
            handleError: (err, handler) => {
                new RequestErrorHandler()
                    .add(404, "*", handler.notFound)
                    .add(403, "*", handler.forbidden)
                    .add(400, "*", handler.badRequest)
                    .add(401, "*", handler.unauthorized)
                    .add(500, "*", "serverError" in handler ? handler.serverError : handler.temporalError)
                    .add("*", "*", "networkError" in handler ? handler.networkError : handler.temporalError)
                    .handle(err);
            },
        };
    }

    /**
     * Method: POST
     * Path: /admin/users/{id}/pardon
     * Pardons an user
     * Requires permission: mod.ban
     * @param id User ID
     * @returns The request parameters
     */
    public static Pardon(id: string): RequestParams<void, PardonErrorHandler> {
        return {
            method: "POST",
            url: getApiUrl(`/admin/users/${encodeURIComponent(id)}/pardon` + generateURIQuery({ _time: Date.now() })),
            handleError: (err, handler) => {
                new RequestErrorHandler()
                    .add(404, "*", handler.notFound)
                    .add(403, "*", handler.forbidden)
                    .add(401, "*", handler.unauthorized)
                    .add(500, "*", "serverError" in handler ? handler.serverError : handler.temporalError)
                    .add("*", "*", "networkError" in handler ? handler.networkError : handler.temporalError)
                    .handle(err);
            },
        };
    }

    /**
     * Method: POST
     * Path: /admin/users/{id}/tfa/disable
     * Disables TFA for an user to recover their account
     * Requires permission: admin.users.manage
     * @param id User ID
     * @returns The request parameters
     */
    public static DisableTFA(id: string): RequestParams<void, DisableTFAErrorHandler> {
        return {
            method: "POST",
            url: getApiUrl(`/admin/users/${encodeURIComponent(id)}/tfa/disable` + generateURIQuery({ _time: Date.now() })),
            handleError: (err, handler) => {
                new RequestErrorHandler()
                    .add(404, "*", handler.notFound)
                    .add(403, "*", handler.forbidden)
                    .add(401, "*", handler.unauthorized)
                    .add(500, "*", "serverError" in handler ? handler.serverError : handler.temporalError)
                    .add("*", "*", "networkError" in handler ? handler.networkError : handler.temporalError)
                    .handle(err);
            },
        };
    }

    /**
     * Method: POST
     * Path: /admin/users/{id}/email
     * Changes the email of an account
     * Requires permission: admin.users.manage
     * @param id User ID
     * @param body Body parameters
     * @returns The request parameters
     */
    public static ChangeEmail(id: string, body: UserAdminEmailChange): RequestParams<void, ChangeEmailErrorHandler> {
        return {
            method: "POST",
            url: getApiUrl(`/admin/users/${encodeURIComponent(id)}/email` + generateURIQuery({ _time: Date.now() })),
            json: body,
            handleError: (err, handler) => {
                new RequestErrorHandler()
                    .add(404, "*", handler.notFound)
                    .add(403, "*", handler.forbidden)
                    .add(400, "EMAIL_IN_USE", handler.badRequestEmailInUse)
                    .add(400, "EMAIL_INVALID", handler.badRequestEmailInvalid)
                    .add(400, "*", handler.badRequest)
                    .add(401, "*", handler.unauthorized)
                    .add(500, "*", "serverError" in handler ? handler.serverError : handler.temporalError)
                    .add("*", "*", "networkError" in handler ? handler.networkError : handler.temporalError)
                    .handle(err);
            },
        };
    }

    /**
     * Method: POST
     * Path: /admin/users/{id}/username
     * Changes the username of an account
     * Requires permission: admin.users.manage
     * @param id User ID
     * @param body Body parameters
     * @returns The request parameters
     */
    public static ChangeUsername(id: string, body: UserAdminUsernameChange): RequestParams<void, ChangeUsernameErrorHandler> {
        return {
            method: "POST",
            url: getApiUrl(`/admin/users/${encodeURIComponent(id)}/username` + generateURIQuery({ _time: Date.now() })),
            json: body,
            handleError: (err, handler) => {
                new RequestErrorHandler()
                    .add(404, "*", handler.notFound)
                    .add(403, "*", handler.forbidden)
                    .add(400, "USERNAME_IN_USE", handler.badRequestUsernameInUse)
                    .add(400, "USERNAME_INVALID", handler.badRequestUsernameInvalid)
                    .add(400, "*", handler.badRequest)
                    .add(401, "*", handler.unauthorized)
                    .add(500, "*", "serverError" in handler ? handler.serverError : handler.temporalError)
                    .add("*", "*", "networkError" in handler ? handler.networkError : handler.temporalError)
                    .handle(err);
            },
        };
    }

    /**
     * Method: POST
     * Path: /admin/users/{id}/password
     * Changes the password of an account
     * Requires permission: admin.users.manage
     * @param id User ID
     * @param body Body parameters
     * @returns The request parameters
     */
    public static ChangePassword(id: string, body: UserAdminPasswordChange): RequestParams<void, ChangePasswordErrorHandler> {
        return {
            method: "POST",
            url: getApiUrl(`/admin/users/${encodeURIComponent(id)}/password` + generateURIQuery({ _time: Date.now() })),
            json: body,
            handleError: (err, handler) => {
                new RequestErrorHandler()
                    .add(404, "*", handler.notFound)
                    .add(403, "*", handler.forbidden)
                    .add(400, "WEAK_PASSWORD", handler.badRequestWeakPassword)
                    .add(400, "*", handler.badRequest)
                    .add(401, "*", handler.unauthorized)
                    .add(500, "*", "serverError" in handler ? handler.serverError : handler.temporalError)
                    .add("*", "*", "networkError" in handler ? handler.networkError : handler.temporalError)
                    .handle(err);
            },
        };
    }
}

/**
 * Error handler for GetUsers
 */
export type GetUsersErrorHandler = CommonAuthenticatedErrorHandler & {
    /**
     * General handler for status = 403
     */
    forbidden: () => void;
};

/**
 * Query parameters for GetUsers
 */
export interface GetUsersQueryParameters {
    /**
     * Search query. Can be id, email or username.
     */
    q?: string;

    /**
     * Role to filter by. Use a dash (-) to filter by default role
     */
    role?: string;

    /**
     * Page. Starting by 1.
     */
    page?: number;

    /**
     * Page size. Max 100.
     */
    pageSize?: number;
}

/**
 * Error handler for GetUser
 */
export type GetUserErrorHandler = CommonAuthenticatedErrorHandler & {
    /**
     * General handler for status = 403
     */
    forbidden: () => void;

    /**
     * General handler for status = 404
     */
    notFound: () => void;
};

/**
 * Error handler for SetRole
 */
export type SetRoleErrorHandler = CommonAuthenticatedErrorHandler & {
    /**
     * General handler for status = 400
     */
    badRequest: () => void;

    /**
     * You cannot change your own role
     */
    badRequestSelf: () => void;

    /**
     * Invalid or non-existent role
     */
    badRequestInvalidRole: () => void;

    /**
     * General handler for status = 403
     */
    forbidden: () => void;

    /**
     * General handler for status = 404
     */
    notFound: () => void;
};

/**
 * Error handler for Ban
 */
export type BanErrorHandler = CommonAuthenticatedErrorHandler & {
    /**
     * General handler for status = 400
     */
    badRequest: () => void;

    /**
     * General handler for status = 403
     */
    forbidden: () => void;

    /**
     * General handler for status = 404
     */
    notFound: () => void;
};

/**
 * Error handler for Pardon
 */
export type PardonErrorHandler = CommonAuthenticatedErrorHandler & {
    /**
     * General handler for status = 403
     */
    forbidden: () => void;

    /**
     * General handler for status = 404
     */
    notFound: () => void;
};

/**
 * Error handler for DisableTFA
 */
export type DisableTFAErrorHandler = CommonAuthenticatedErrorHandler & {
    /**
     * General handler for status = 403
     */
    forbidden: () => void;

    /**
     * General handler for status = 404
     */
    notFound: () => void;
};

/**
 * Error handler for ChangeEmail
 */
export type ChangeEmailErrorHandler = CommonAuthenticatedErrorHandler & {
    /**
     * General handler for status = 400
     */
    badRequest: () => void;

    /**
     * Invalid email
     */
    badRequestEmailInvalid: () => void;

    /**
     * Email is in use
     */
    badRequestEmailInUse: () => void;

    /**
     * General handler for status = 403
     */
    forbidden: () => void;

    /**
     * General handler for status = 404
     */
    notFound: () => void;
};

/**
 * Error handler for ChangeUsername
 */
export type ChangeUsernameErrorHandler = CommonAuthenticatedErrorHandler & {
    /**
     * General handler for status = 400
     */
    badRequest: () => void;

    /**
     * Invalid username
     */
    badRequestUsernameInvalid: () => void;

    /**
     * Username in use
     */
    badRequestUsernameInUse: () => void;

    /**
     * General handler for status = 403
     */
    forbidden: () => void;

    /**
     * General handler for status = 404
     */
    notFound: () => void;
};

/**
 * Error handler for ChangePassword
 */
export type ChangePasswordErrorHandler = CommonAuthenticatedErrorHandler & {
    /**
     * General handler for status = 400
     */
    badRequest: () => void;

    /**
     * Password too weak
     */
    badRequestWeakPassword: () => void;

    /**
     * General handler for status = 403
     */
    forbidden: () => void;

    /**
     * General handler for status = 404
     */
    notFound: () => void;
};


// API bindings: roles_admin (Auto generated)

"use strict";

import { RequestErrorHandler, RequestParams, CommonAuthenticatedErrorHandler } from "@asanrom/request-browser";
import { getApiUrl, generateURIQuery } from "./utils";
import { GlobalRole, RoleModifyBody } from "./definitions";

export class ApiRolesAdmin {
    /**
     * Method: GET
     * Path: /admin/roles
     * Gets list of roles
     * Requires permission: admin.roles
     * @returns The request parameters
     */
    public static GetRoles(): RequestParams<GlobalRole[], GetRolesErrorHandler> {
        return {
            method: "GET",
            url: getApiUrl(`/admin/roles` + generateURIQuery({ _time: Date.now() })),
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
     * Method: POST
     * Path: /admin/roles
     * Creates a role
     * Requires permission: admin.roles
     * @param body Body parameters
     * @returns The request parameters
     */
    public static CreateRole(body: GlobalRole): RequestParams<void, CreateRoleErrorHandler> {
        return {
            method: "POST",
            url: getApiUrl(`/admin/roles` + generateURIQuery({ _time: Date.now() })),
            json: body,
            handleError: (err, handler) => {
                new RequestErrorHandler()
                    .add(403, "*", handler.forbidden)
                    .add(400, "DUPLICATED", handler.badRequestDuplicated)
                    .add(400, "INVALID_ID", handler.badRequestInvalidId)
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
     * Path: /admin/roles/{id}
     * Modifies a role
     * Requires permission: admin.roles
     * @param id Role identifier (Use a dash (-) for the default role).
     * @param body Body parameters
     * @returns The request parameters
     */
    public static ModifyRole(id: string, body: RoleModifyBody): RequestParams<void, ModifyRoleErrorHandler> {
        return {
            method: "POST",
            url: getApiUrl(`/admin/roles/${encodeURIComponent(id)}` + generateURIQuery({ _time: Date.now() })),
            json: body,
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
     * Method: DELETE
     * Path: /admin/roles/{id}
     * Deletes a role
     * Requires permission: admin.roles
     * @param id Role identifier.
     * @returns The request parameters
     */
    public static DeleteRole(id: string): RequestParams<void, DeleteRoleErrorHandler> {
        return {
            method: "DELETE",
            url: getApiUrl(`/admin/roles/${encodeURIComponent(id)}` + generateURIQuery({ _time: Date.now() })),
            handleError: (err, handler) => {
                new RequestErrorHandler()
                    .add(403, "*", handler.forbidden)
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
 * Error handler for GetRoles
 */
export type GetRolesErrorHandler = CommonAuthenticatedErrorHandler & {
    /**
     * General handler for status = 403
     */
    forbidden: () => void;
};

/**
 * Error handler for CreateRole
 */
export type CreateRoleErrorHandler = CommonAuthenticatedErrorHandler & {
    /**
     * General handler for status = 400
     */
    badRequest: () => void;

    /**
     * Invalid identifier (Must not be empty, cannot be admin, max 80 characters, only lowercase letters, numbers and underscores)
     */
    badRequestInvalidId: () => void;

    /**
     * Another role was found with the same ID
     */
    badRequestDuplicated: () => void;

    /**
     * General handler for status = 403
     */
    forbidden: () => void;
};

/**
 * Error handler for ModifyRole
 */
export type ModifyRoleErrorHandler = CommonAuthenticatedErrorHandler & {
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
 * Error handler for DeleteRole
 */
export type DeleteRoleErrorHandler = CommonAuthenticatedErrorHandler & {
    /**
     * General handler for status = 400
     */
    badRequest: () => void;

    /**
     * General handler for status = 403
     */
    forbidden: () => void;
};


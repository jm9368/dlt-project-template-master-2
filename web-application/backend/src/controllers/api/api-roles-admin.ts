// Reserved for license

"use strict";

import { ObjectSchema } from "@asanrom/javascript-object-sanitizer";
import Express from "express";
import { ADMIN_ROLE, UsersService } from "../../services/users-service";
import { BAD_REQUEST, ensureObjectBody, FORBIDDEN, noCache, NOT_FOUND, sendApiError, sendApiResult, sendApiSuccess, sendUnauthorized } from "../../utils/http-utils";
import { Controller } from "../controller";
import { GLOBAL_PERMISSIONS, UserRole } from "../../models/users/user-role";

const ROLE_ID_MAX_LENGTH = 80;

/**
 * Roles admin API
 * @group roles_admin
 */
export class RolesAdminController extends Controller {
    public registerAPI(prefix: string, application: Express.Express): any {
        application.get(prefix + "/admin/roles", noCache(this.getRoles.bind(this)));

        application.post(prefix + "/admin/roles", ensureObjectBody(this.createRole.bind(this)));

        application.post(prefix + "/admin/roles/:id", ensureObjectBody(this.modifyRole.bind(this)));
        application.delete(prefix + "/admin/roles/:id", ensureObjectBody(this.deleteRole.bind(this)));
    }

    /**
     * @typedef GlobalRolePermission
     * @property {string} id.required - Permission identifier
     * @property {boolean} granted - True if the permission is granted
     */

    /**
     * @typedef GlobalRole
     * @property {string} id.required - Role identifier
     * @property {Array.<GlobalRolePermission>} permissions.required - List of permissions
     */

    /**
     * Gets list of roles
     * Requires permission: admin.roles
     * Binding: GetRoles
     * @route GET /admin/roles
     * @group roles_admin
     * @returns {void} 403 - Access denied
     * @returns {Array.<GlobalRole>} 200 - List of roles
     * @security AuthToken
     */
    public async getRoles(request: Express.Request, response: Express.Response) {
        const auth = await UsersService.getInstance().auth(request);
        if (!auth.isRegisteredUser()) {
            sendUnauthorized(request, response);
            return;
        }

        if (!auth.hasPermission("admin.roles")) {
            sendApiError(
                request,
                response,
                FORBIDDEN,
                "",
                "The user lacks the required permission: admin.roles",
            );
            return;
        }

        const result: { id: string, permissions: { id: string, granted: boolean }[] }[] = [];

        // Add global 

        result.push({
            id: ADMIN_ROLE,
            permissions: Object.keys(GLOBAL_PERMISSIONS).map(p => {
                return {
                    id: p,
                    granted: true,
                };
            }),
        });

        // Add non-default

        const roles = await UserRole.getAllNonDefault();

        for (const role of roles) {
            if (role.id === ADMIN_ROLE) {
                continue;
            }

            const permissionsSet = new Set(role.getPermissionsList());

            result.push({
                id: role.id,
                permissions: Object.keys(GLOBAL_PERMISSIONS).map(p => {
                    return {
                        id: p,
                        granted: permissionsSet.has(p),
                    };
                }),
            });
        }

        // Add default

        const defaultRole = await UserRole.getDefault();

        if (defaultRole) {
            const permissionsSet = new Set(defaultRole.getPermissionsList());
            result.push({
                id: "",
                permissions: Object.keys(GLOBAL_PERMISSIONS).map(p => {
                    return {
                        id: p,
                        granted: permissionsSet.has(p),
                    };
                }),
            });
        } else {
            result.push({
                id: "",
                permissions: Object.keys(GLOBAL_PERMISSIONS).map(p => {
                    return {
                        id: p,
                        granted: false,
                    };
                }),
            });
        }

        sendApiResult(request, response, result);
    }

    /**
     * @typedef CreateRoleBadRequest
     * @property {string} code.required - Error Code:
     *  - INVALID_ID: Invalid identifier (Must not be empty, cannot be admin, max 80 characters, only lowercase letters, numbers and underscores)
     *  - DUPLICATED: Another role was found with the same ID
     */

    /**
     * Creates a role
     * Requires permission: admin.roles
     * Binding: CreateRole
     * @route POST /admin/roles
     * @group roles_admin
     * @param {GlobalRole.model} request.body - Role to create
     * @returns {CreateRoleBadRequest.model} 400 - Bad request
     * @returns {void} 403 - Access denied
     * @returns {void} 200 - Success
     * @security AuthToken
     */
    public async createRole(request: Express.Request, response: Express.Response) {
        const auth = await UsersService.getInstance().auth(request);
        if (!auth.isRegisteredUser()) {
            sendUnauthorized(request, response);
            return;
        }

        if (!auth.hasPermission("admin.roles")) {
            sendApiError(
                request,
                response,
                FORBIDDEN,
                "",
                "The user lacks the required permission: admin.roles",
            );
            return;
        }

        const roleData: { id: string, permissions: { id: string, granted: boolean }[] } = ObjectSchema.object({
            id: ObjectSchema.string().withDefaultValue(""),
            permissions: ObjectSchema.array(ObjectSchema.object({
                id: ObjectSchema.string().withDefaultValue(""),
                granted: ObjectSchema.boolean(),
            })).withDefaultValue([]),
        }).sanitize(request.body);

        const roleId = roleData.id;

        if (!roleId || roleId.length > ROLE_ID_MAX_LENGTH || !((/^[a-z0-9\_]+$/).test(roleId))) {
            sendApiError(
                request,
                response,
                BAD_REQUEST,
                "INVALID_ID",
                "The client provided an invalid role id",
            );
            return;
        }

        if (roleId === ADMIN_ROLE) {
            sendApiError(
                request,
                response,
                BAD_REQUEST,
                "DUPLICATED",
                "The client provided the reserved admin role id",
            );
            return;
        }

        const existingRole = await UserRole.finder.findByKey(roleId);

        if (existingRole) {
            sendApiError(
                request,
                response,
                BAD_REQUEST,
                "DUPLICATED",
                "The client provided a duplicated role id",
            );
            return;
        }

        const newRole = new UserRole({
            id: roleId,
        });

        const permissions = roleData.permissions.filter(p => {
            return p.granted && GLOBAL_PERMISSIONS[p.id];
        }).map(p => p.id);

        newRole.setPermissionList(permissions);

        await newRole.insert();

        request.logger.info("[ADMIN] Created role", { by: {id: auth.user.id, username: auth.user.username}, role: newRole.id, permissions: permissions});

        sendApiSuccess(request, response);
    }

    /**
     * @typedef RoleModifyBody
     * @property {Array.<GlobalRolePermission>} permissions.required - List of permissions
     */

    /**
     * Modifies a role
     * Requires permission: admin.roles
     * Binding: ModifyRole
     * @route POST /admin/roles/{id}
     * @group roles_admin
     * @param {string} id.path.required - Role identifier (Use a dash (-) for the default role).
     * @param {RoleModifyBody.model} request.body - Request body
     * @returns {CreateRoleBadRequest.model} 400 - Bad request
     * @returns {void} 400 - The role cannot be modified (admin role)
     * @returns {void} 403 - Access denied
     * @returns {void} 404 - Role not found
     * @returns {void} 200 - Success
     * @security AuthToken
     */
    public async modifyRole(request: Express.Request, response: Express.Response) {
        const auth = await UsersService.getInstance().auth(request);
        if (!auth.isRegisteredUser()) {
            sendUnauthorized(request, response);
            return;
        }

        if (!auth.hasPermission("admin.roles")) {
            sendApiError(
                request,
                response,
                FORBIDDEN,
                "",
                "The user lacks the required permission: admin.roles",
            );
            return;
        }

        let roleId = request.params.id + "";

        if (roleId === "-") {
            roleId = "";
        }

        if (roleId === ADMIN_ROLE) {
            sendApiError(
                request,
                response,
                BAD_REQUEST,
                "ADMIN_ROLE",
                "The client tried to modify the admin role",
            );
            return;
        }

        let role: UserRole = await UserRole.finder.findByKey(roleId);

        if (!role && roleId === "") {
            role = new UserRole({
                id: "",
                permissions: "",
            });

            await role.insert();
        } else if (!role) {
            sendApiError(
                request,
                response,
                NOT_FOUND,
                "NOT_FOUND",
                "The role was not found in the database",
            );
            return;
        }

        const roleData: { permissions: { id: string, granted: boolean }[] } = ObjectSchema.object({
            permissions: ObjectSchema.array(ObjectSchema.object({
                id: ObjectSchema.string().withDefaultValue(""),
                granted: ObjectSchema.boolean(),
            })).withDefaultValue([]),
        }).sanitize(request.body);

        const permissions = roleData.permissions.filter(p => {
            return p.granted && GLOBAL_PERMISSIONS[p.id];
        }).map(p => p.id);

        role.setPermissionList(permissions);

        await role.save();

        request.logger.info("[ADMIN] Modified role", { by: {id: auth.user.id, username: auth.user.username}, role: role.id, permissions:  permissions});

        sendApiSuccess(request, response);
    }

    /**
     * Deletes a role
     * Requires permission: admin.roles
     * Binding: DeleteRole
     * @route DELETE /admin/roles/{id}
     * @group roles_admin
     * @param {string} id.path.required - Role identifier.
     * @returns {void} 400 - The role cannot be deleted (admin role or default role)
     * @returns {void} 403 - Access denied
     * @returns {void} 200 - Success
     * @security AuthToken
     */
    public async deleteRole(request: Express.Request, response: Express.Response) {
        const auth = await UsersService.getInstance().auth(request);
        if (!auth.isRegisteredUser()) {
            sendUnauthorized(request, response);
            return;
        }

        if (!auth.hasPermission("admin.roles")) {
            sendApiError(
                request,
                response,
                FORBIDDEN,
                "",
                "The user lacks the required permission: admin.roles",
            );
            return;
        }

        const roleId = request.params.id + "";

        if (!roleId || roleId === ADMIN_ROLE) {
            sendApiError(
                request,
                response,
                BAD_REQUEST,
                "CANNOT_DELETE",
                "The client tried to delete a static role",
            );
            return;
        }

        const role = await UserRole.finder.findByKey(roleId);

        if (role) {
            await role.delete();

            request.logger.info("[ADMIN] Deleted role", { by: {id: auth.user.id, username: auth.user.username}, role: role.id});
        }

        sendApiSuccess(request, response);
    }
}


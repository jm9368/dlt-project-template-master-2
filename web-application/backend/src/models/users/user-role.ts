// Global roles and permissions

import { DataModel, DataSource, DataFinder, DataFilter, OrderBy, GenericRow, enforceType, TypedRow } from "tsbean-orm";

const DATA_SOURCE = DataSource.DEFAULT;
const TABLE = "user_roles";
const PRIMARY_KEY = "id";

/**
 * Roles
 */
export class UserRole extends DataModel {
    public static finder = new DataFinder<UserRole>(DATA_SOURCE, TABLE, PRIMARY_KEY, function (data: any) {
        return new UserRole(data);
    });

    public static async getAllNonDefault(): Promise<UserRole[]> {
        return UserRole.finder.find(DataFilter.notEquals("id", ""));
    } 

    public static async getDefault(): Promise<UserRole> {
        return UserRole.finder.findByKey("");
    } 


    public id: string;

    /* db-type: text */
    public permissions: string;

    constructor(data: TypedRow<UserRole>) {
        super(DATA_SOURCE, TABLE, PRIMARY_KEY);

        this.id = enforceType(data.id, "string") || "";
        this.permissions = enforceType(data.permissions, "string") || "";

        this.init();
    }

    public getPermissionsList(): string[] {
        return this.permissions.split(",").filter(a => a);
    }

    public setPermissionList(permissions: string[]) {
        this.permissions = permissions.join(",");
    }
}

/* db-ignore */

/**
 * List of global permissions
 */
export const GLOBAL_PERMISSIONS = {
    /**
     * Permission to manage users. Change the username, email, reset password, etc
     */
    "admin.users.manage": 1,

    /**
     * Permission to change roles and permissions
     */
    "admin.roles": 1,

    /**
     * Permission to view the users list and search for users
     */
    "mod.users": 1,

    /**
     * Permission to ban / unban users
     */
    "mod.ban": 1,

    /**
     * Immunity to moderation (ban / unban)
     */
    "mod.immune": 1,
};


/**
 * Global permission id type
 */
export type GlobalPermission = keyof (typeof GLOBAL_PERMISSIONS);

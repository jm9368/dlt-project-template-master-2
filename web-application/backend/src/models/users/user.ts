// User Model

"use strict";

import Crypto from "crypto";
import { createRandomToken, createRandomUID } from "../../utils/text-utils";
import { DataModel, DataSource, DataFinder, DataFilter, OrderBy, SelectOptions, TypedRow, enforceType } from "tsbean-orm";
import { ADMIN_ROLE } from "../../services/users-service";
import { UserRole } from "./user-role";

const DATA_SOURCE = DataSource.DEFAULT;
const TABLE = "users";
const PRIMARY_KEY = "id";

const SALT_LENGTH_BYTES = 16;

const MIN_USER_NAME_LENGTH = 3;
const MAX_USER_NAME_LENGTH = 20;

const PASSWORD_RESET_EXPIRATION = 2 * 60 * 60 * 1000;

/**
 * Represents an user.
 */
export class User extends DataModel {

    public static finder = new DataFinder<User>(DATA_SOURCE, TABLE, PRIMARY_KEY, function (data: any) {
        return new User(data);
    });

    public static async countAll(): Promise<number> {
        return User.finder.count(DataFilter.any());
    }

    public static async countFiltered(q?: string, role?: string): Promise<number> {
        if (q && role !== undefined) {
            return User.finder.count(DataFilter.and(
                DataFilter.startsWith("username", q, true),
                DataFilter.equals("role", role),
            ));
        } else if (q) {
            return User.finder.count(DataFilter.startsWith("username", q, true));
        } else if (role !== undefined) {
            return User.finder.count(DataFilter.equals("role", role));
        } else {
            return User.finder.count(DataFilter.any());
        }
    }

    public static async findFiltered(skip: number, limit: number, q?: string, role?: string): Promise<User[]> {
        if (q && role !== undefined) {
            return User.finder.find(DataFilter.and(
                DataFilter.startsWith("username", q, true),
                DataFilter.equals("role", role),
            ), OrderBy.nothing(), SelectOptions.configure().setFirstRow(skip).setMaxRows(limit));
        } else if (q) {
            return User.finder.find(
                DataFilter.startsWith("username", q, true),
                OrderBy.nothing(),
                SelectOptions.configure().setFirstRow(skip).setMaxRows(limit)
            );
        } else if (role !== undefined) {
            return User.finder.find(
                DataFilter.equals("role", role),
                OrderBy.nothing(),
                SelectOptions.configure().setFirstRow(skip).setMaxRows(limit)
            );
        } else {
            return User.finder.find(
                DataFilter.any(),
                OrderBy.nothing(),
                SelectOptions.configure().setFirstRow(skip).setMaxRows(limit)
            );
        }
    }

    /**
     * Finds an user by email or username
     * @param inputName Either the username or the email
     * @param callback The callback
     */
    public static async findUser(inputName: string): Promise<User> {
        inputName = ("" + inputName).toLowerCase();
        const userByName = await User.finder.find(
            DataFilter.equals("usernameLowerCase", inputName),
            OrderBy.nothing(),
        );

        if (userByName.length > 0) {
            return userByName[0];
        }

        const userByEmail = await User.finder.find(
            DataFilter.equals("email", inputName),
            OrderBy.nothing(),
        );

        return userByEmail[0] || null;
    }


    public static async findAll(skip: number, limit: number): Promise<User[]> {
        return User.finder.find(DataFilter.any(), OrderBy.asc("id"), SelectOptions.configure().setFirstRow(skip).setMaxRows(limit));
    }


    /**
     * Finds an user by  username
     * @param username The username
     * @param callback The callback
     */
    public static async findUserByUsername(username: string): Promise<User> {
        const users = await User.finder.find(
            DataFilter.equals("usernameLowerCase", ("" + username).toLowerCase()),
            OrderBy.nothing(),
        );
        return users[0] || null;
    }

    /**
     * Finds an user by its UID.
     * @param uid The user identifier.
     */
    public static async findUserByUID(uid: string): Promise<User> {
        return User.finder.findByKey(uid);
    }

    /**
     * Validates an username. Note: Username is the name used to login
     * @param name The username.
     * @returns True if the username is valid, false if it is invalid.
     */
    public static validateUserName(name: string) {
        if (name.length < MIN_USER_NAME_LENGTH || name.length > MAX_USER_NAME_LENGTH) {
            return false;
        }
        if (!(/^[a-z0-9\s_]+$/i).test(name)) {
            return false;
        }

        return true;
    }

    /**
     * Registers an user with basic credentials (email, username and password)
     * @param email The email.
     * @param username The username.
     * @param password The password.
     * @param emailVerified True if the email is already verified
     * @param locale User locale
     */
    public static async registerUser(email: string, username: string, password: string, emailVerified: boolean, locale: string): Promise<User> {
        const passwdSalt = randomSalt();
        const user: User = new User({
            id: createRandomUID(),
            email: email.toLowerCase(),
            emailVerified: !!emailVerified,
            emailVerificationCode: createRandomToken(),
            username,
            passwordHash: computePasswordHash(password, passwdSalt),
            passwordSalt: passwdSalt,
            created: Date.now(),
            locale: locale,
        });

        try {
            await user.insert();
        } catch (ex) {
            return Promise.reject(ex);
        }

        return Promise.resolve(user);
    }

    /**
     * Registers an user with basic credentials (email, username and password)
     * @param email The email.
     * @param username The username.
     * @param password The password.
     */
    public static async registerConfiguredAdministrator(email: string, username: string, password: string): Promise<User> {
        const passwdSalt = randomSalt();
        const user: User = new User({
            id: createRandomUID(),
            email: email.toLowerCase(),
            emailVerified: true,
            emailVerificationCode: createRandomToken(),
            username,
            passwordHash: computePasswordHash(password, passwdSalt),
            passwordSalt: passwdSalt,
            created: Date.now(),
            role: ADMIN_ROLE,
        });

        try {
            await user.insert();
        } catch (ex) {
            return Promise.reject(ex);
        }

        return Promise.resolve(user);
    }

    /**
     * Clears unverified users from the database
     * @returns The number of deleted users
     */
    public static async clearUnverifiedUsers(): Promise<number> {
        return User.finder.delete(DataFilter.and(
            DataFilter.equals("emailVerified", false),
            DataFilter.lessThan("created", Date.now() - (24 * 60 * 60 * 1000)),
        ));
    }

    public id: string;

    // Username
    public username: string;

    /* db-index-unique: usernameLowerCase */
    public usernameLowerCase: string;

    // Email
    public email: string;
    public emailVerified: boolean;
    public emailVerificationCode: string;
    public emailRequest: string;

    /* db-index-unique: email */

    // Password
    public passwordHash: string;
    public passwordSalt: string;
    public passwordResetCode: string;

    /* db-type: bigint */
    public passwordResetExpiration: number;

    // Role
    /* db-index: role */
    public role: string;

    // Banned
    public banned: boolean;

    // Two-factor authentication
    public tfa: boolean;
    public tfaSecret: string;

    // Creation timestamp
    /* db-type: bigint */
    public created: number;

    // User locale
    public locale: string;

    // Constructor

    constructor(data: TypedRow<User>) {
        super(DATA_SOURCE, TABLE, PRIMARY_KEY);

        this.id = data.id;

        this.email = data.email || "";
        this.username = data.username || "";
        this.usernameLowerCase = this.username.toLowerCase();
        this.passwordHash = data.passwordHash || "";
        this.passwordSalt = data.passwordSalt || "";
        this.emailVerified = !!data.emailVerified;
        this.emailVerificationCode = data.emailVerificationCode || "";
        this.emailRequest = data.emailRequest || "";
        this.passwordResetCode = data.passwordResetCode || "";
        this.passwordResetExpiration = data.passwordResetExpiration || 0;

        this.role = data.role || "";

        this.banned = !!data.banned;

        this.tfa = !!data.tfa;
        this.tfaSecret = data.tfaSecret || "";

        this.created = enforceType(data.created, "int") || 0;
        this.locale = data.locale || "";

        this.init();
    }

    /**
     * Checks the user's password.
     * @param password The password.
     */
    public checkPassword(password: string): boolean {
        return checkPassword(this.passwordHash, this.passwordSalt, password);
    }

    /**
     * Generates a new code for changing the password
     */
    public async generateResetCode() {
        this.passwordResetCode = createRandomUID();
        this.passwordResetExpiration = Date.now() + PASSWORD_RESET_EXPIRATION;
        await this.save();
    }

    /**
     * Changes the user password.
     * @param password The new password
     */
    public async changePassword(password: string) {
        this.passwordSalt = randomSalt();
        this.passwordHash = computePasswordHash(password, this.passwordSalt);
        this.passwordResetExpiration = 0;
        await this.save();
    }

    /**
     * Checks if the user is immune to moderation
     * @returns True if the user is immune
     */
    public async isImmuneToModeration(): Promise<boolean> {
        if (this.role === ADMIN_ROLE) {
            return true;
        }

        const role = await UserRole.finder.findByKey(this.role);

        if (!role) {
            return false;
        }

        return role.getPermissionsList().includes("mod.immune");
    }
}

/**
 * Generates a random salt.
 * @returns A random salt.
 */
function randomSalt(): string {
    return Crypto.randomBytes(SALT_LENGTH_BYTES).toString("hex");
}

/**
 * Computes the hash of a password.
 * @param password The password.
 * @param salt The salt.
 * @returns The password hash
 */
function computePasswordHash(password: string, salt: string): string {
    const hash = Crypto.createHash("sha256");
    hash.update(password, "utf8");
    hash.update(salt, "utf8");
    return hash.digest().toString("hex");
}

/**
 * Checks a password.
 * @param passwordHash The password hash.
 * @param passwordSalt The salt.
 * @param password The input password.
 * @returns true if the password is valid, false if it is invalid.
 */
function checkPassword(passwordHash: string, passwordSalt: string, password: string): boolean {
    try {
        return Crypto.timingSafeEqual(Buffer.from(computePasswordHash(password, passwordSalt), 'hex'), Buffer.from(passwordHash, 'hex'));
    } catch (ex) {
        return false;
    }
}

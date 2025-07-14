// Tools to create and prepare users for tests

"use strict";

import Crypto from "crypto";
import { APITester } from "../api-tester";
import { APIAuthentication } from "../authentication";
import { ApiAuth } from "../api-bindings/api-group-auth";
import { User } from "../../../../src/models/users/user";
import { ADMIN_ROLE } from "../../../../src/services/users-service";

/**
 * Prepared user details
 */
export interface PreparedUser {
    uid: string;
    username: string,
    email: string,
    password: string,
    auth: APIAuthentication
}

/**
 * Functions to generate test users
 */
export class TestUsers {
    private static NextPrepUser = 0;

    /**
     * Prepares a brand new user to test the API
     * @param admin True to set the user with administrator privileges
     * @returns The generated user details
     */
    public static async NewUser(admin?: boolean): Promise<PreparedUser> {
        // Generate username, password and email for the user

        TestUsers.NextPrepUser++;

        const email = "test_mail_" + Crypto.randomBytes(4).toString("hex") + "_" + TestUsers.NextPrepUser + "@test.com";
        const username = "test_user_" + TestUsers.NextPrepUser;
        const password = Crypto.randomBytes(24).toString("hex");

        // Register user

        //email, username, password, ""
        const register_result = await APITester.Test(ApiAuth.Signup({email: email, username: username, password: password}), APIAuthentication.Unauthenticated());

        if (!register_result.session_id) {
            throw new Error("Expected signup API to return a session, but got no session");
        }

        if (admin) {
            const user = await User.findUserByUID(register_result.uid);

            user.role = ADMIN_ROLE;
            await user.save();
        }

        return {
            uid: register_result.uid,
            username: username,
            email: email,
            password: password,
            auth: new APIAuthentication(register_result.session_id)
        };
    }

    /**
     * Creates a new administrator user
     * @returns The generated user details
     */
    public static NewAdministrator(): Promise<PreparedUser> {
        return TestUsers.NewUser(true);
    }

    /**
     * Creates a new regular user
     * @returns The generated user details
     */
    public static NewRegularUser(): Promise<PreparedUser> {
        return TestUsers.NewUser(false);
    }
}

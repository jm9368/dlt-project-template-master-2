// API tests

"use strict";

import assert from "assert";
import speakeasy from "speakeasy";
import { APITester } from '../test-tools/api-tester';
import { PreparedUser, TestUsers } from '../test-tools/models/users';
import { ApiUsersAdmin } from "../test-tools/api-bindings/api-group-users-admin";
import { ApiAccount } from "../test-tools/api-bindings/api-group-account";
import { TOTP_STEP } from "../../../src/services/tfa-service";
import { ApiAuth } from "../test-tools/api-bindings/api-group-auth";
import { APIAuthentication } from "../test-tools/authentication";


// Test group
describe("API / Admin / Users", () => {
    let testAdmin: PreparedUser;
    let testUser: PreparedUser;
    let testUser2: PreparedUser;

    before(async () => {
        // Setup test server (REQUIRED)
        await APITester.Initialize();

        // Setup users
        testAdmin = await TestUsers.NewAdministrator();
        testUser = await TestUsers.NewRegularUser();
        testUser2 = await TestUsers.NewRegularUser();
    });

    // Tests

    it('Should fail if called by unauthorized user', async () => {
        await APITester.TestError(ApiUsersAdmin.GetUsers({}), testUser.auth, 403);
        await APITester.TestError(ApiUsersAdmin.GetUser('test'), testUser.auth, 403);
        await APITester.TestError(ApiUsersAdmin.Ban('test'), testUser.auth, 403);
        await APITester.TestError(ApiUsersAdmin.Pardon('test'), testUser.auth, 403);
        await APITester.TestError(ApiUsersAdmin.SetRole('test', { role: 'admin' }), testUser.auth, 403);
        await APITester.TestError(ApiUsersAdmin.DisableTFA('test'), testUser.auth, 403);
        await APITester.TestError(ApiUsersAdmin.ChangeUsername('test', { username: 'test' }), testUser.auth, 403);
        await APITester.TestError(ApiUsersAdmin.ChangeEmail('test', { email: 'test@example.com' }), testUser.auth, 403);
        await APITester.TestError(ApiUsersAdmin.ChangePassword('test', { password: 'password123456' }), testUser.auth, 403);
    });

    it('Should be able to list users', async () => {
        let r = await APITester.Test(ApiUsersAdmin.GetUsers({}), testAdmin.auth);

        assert(r.users.length >= 2);

        r = await APITester.Test(ApiUsersAdmin.GetUsers({ q: testUser.uid }), testAdmin.auth);

        assert.equal(r.users.length, 1);
        assert.equal(r.users[0].id, testUser.uid);

        r = await APITester.Test(ApiUsersAdmin.GetUsers({ q: testUser.username }), testAdmin.auth);

        assert.equal(r.users.length, 1);
        assert.equal(r.users[0].id, testUser.uid);

        r = await APITester.Test(ApiUsersAdmin.GetUsers({ q: testUser.email }), testAdmin.auth);

        assert.equal(r.users.length, 1);
        assert.equal(r.users[0].id, testUser.uid);
    });

    it('Should be able to get user details', async () => {
        const r = await APITester.Test(ApiUsersAdmin.GetUser(testUser.uid), testAdmin.auth);

        assert.equal(r.id, testUser.uid);
        assert.equal(r.username, testUser.username);
        assert.equal(r.email, testUser.email);
    });

    it('Should be able to ban an user', async () => {
        await APITester.Test(ApiUsersAdmin.Ban(testUser.uid), testAdmin.auth);

        // Check
        const r = await APITester.Test(ApiUsersAdmin.GetUser(testUser.uid), testAdmin.auth);

        assert.equal(r.id, testUser.uid);
        assert.equal(r.banned, true);
    });

    it('Should be able to pardon an user', async () => {
        await APITester.Test(ApiUsersAdmin.Pardon(testUser.uid), testAdmin.auth);

        // Check
        const r = await APITester.Test(ApiUsersAdmin.GetUser(testUser.uid), testAdmin.auth);

        assert.equal(r.id, testUser.uid);
        assert.equal(r.banned, false);
    });

    const newUsername = "n_usr_admin_test";

    it('Should be able to change username (Management)', async () => {
        await APITester.Test(ApiUsersAdmin.ChangeUsername(testUser.uid, { username: newUsername }), testAdmin.auth);

        // Check
        const r = await APITester.Test(ApiUsersAdmin.GetUser(testUser.uid), testAdmin.auth);

        assert.equal(r.id, testUser.uid);
        assert.equal(r.username, newUsername);
    });

    const newEmail = "newemailadminmngtest@example.com";

    it('Should be able to change email (Management)', async () => {
        await APITester.Test(ApiUsersAdmin.ChangeEmail(testUser.uid, { email: newEmail }), testAdmin.auth);

        // Check
        const r = await APITester.Test(ApiUsersAdmin.GetUser(testUser.uid), testAdmin.auth);

        assert.equal(r.id, testUser.uid);
        assert.equal(r.email, newEmail);
    });

    it('Should be able to change password (Management)', async () => {
        const newPassword = "password12346";
        await APITester.Test(ApiUsersAdmin.ChangePassword(testUser.uid, { password: newPassword }), testAdmin.auth);

        const loginRes = await APITester.Test(ApiAuth.Login({ username: newUsername, password: newPassword, remember: true }), APIAuthentication.Unauthenticated());

        assert.equal(loginRes.uid, testUser.uid);
    });


    it('Should be able to disable Two factor Authentication (Management)', async () => {
        // Enable TFA for test user
        const tfaGenResponse = await APITester.Test(ApiAccount.GenerateTFA(), testUser2.auth);
        let tfaToken = speakeasy.totp({ secret: tfaGenResponse.secret, encoding: 'base32', step: TOTP_STEP });
        await APITester.Test(ApiAccount.SetupTFA({ secret: tfaGenResponse.secret, password: testUser2.password, token: tfaToken }), testUser2.auth);

        // Check user details
        let r = await APITester.Test(ApiUsersAdmin.GetUser(testUser2.uid), testAdmin.auth);

        assert.equal(r.id, testUser2.uid);
        assert.equal(r.tfa, true);

        // Disable TFA via admin API
        await APITester.Test(ApiUsersAdmin.DisableTFA(testUser2.uid), testAdmin.auth);

        // Check again
        r = await APITester.Test(ApiUsersAdmin.GetUser(testUser2.uid), testAdmin.auth);

        assert.equal(r.id, testUser2.uid);
        assert.equal(r.tfa, false);
    });
});

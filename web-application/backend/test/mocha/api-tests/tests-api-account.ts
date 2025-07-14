// API tests

"use strict";

import { expect } from 'chai';
import { PreparedUser, TestUsers } from '../test-tools/models/users';
import { APITester } from '../test-tools/api-tester';
import { ApiAccount } from '../test-tools/api-bindings/api-group-account';
import { ApiAuth } from '../test-tools/api-bindings/api-group-auth';
import { APIAuthentication } from '../test-tools/authentication';
import speakeasy from "speakeasy";
import { TOTP_STEP } from "../../../src/services/tfa-service";
import { SessionListItem } from '../test-tools/api-bindings/definitions';


// Test group
describe("API / Account", () => {

    let testUser: PreparedUser;
    let testUser2: PreparedUser;
    let testUser3: PreparedUser;

    let newUsername: string;
    let newEmail: string;
    let newPassword: string;

    before(async () => {

        // Setup test server (REQUIRED)
        await APITester.Initialize();

        // Setup users
        testUser = await TestUsers.NewRegularUser();
        testUser2 = await TestUsers.NewRegularUser();
        testUser3 = await TestUsers.NewRegularUser();

        // Setup new data
        newUsername = "new_username";
        newEmail = "new_email@test.com";
        newPassword = "new_password";
    });

    // Tests

    it('Should change username for the test user', async () => {
        await APITester.Test(ApiAccount.ChangeUsername({ username: newUsername, password: testUser.password }), testUser.auth);

        const context = await APITester.Test(ApiAuth.GetContext(), testUser.auth);

        expect(context.username).to.be.equal(newUsername);
    });

    it('Should change email for the test user', async () => {
        await APITester.Test(ApiAccount.ChangeEmail({ email: newEmail, password: testUser.password }), testUser.auth);

        const context = await APITester.Test(ApiAuth.GetContext(), testUser.auth);

        expect(context.email).to.be.equal(newEmail);
    });

    it('Should change password for the test user', async () => {
        await APITester.Test(ApiAccount.ChangePassword({ old_password: testUser.password, new_password: newPassword }), testUser.auth);

        //newUsername, newPassword, "", true

        const loginRes = await APITester.Test(ApiAuth.Login({ username: newUsername, password: newPassword, remember: true }), APIAuthentication.Unauthenticated());

        expect(loginRes.uid).to.be.equal(testUser.uid);
    });

    let test_tfa_secret: string;

    it('Should generate two factor authentication', async () => {
        const response = await APITester.Test(ApiAccount.GenerateTFA(), testUser.auth);

        expect(response).not.be.equal(null);

        test_tfa_secret = response.secret;
    });

    it('Should setup two factor authentication', async () => {
        let tfaToken = speakeasy.totp({ secret: test_tfa_secret, encoding: 'base32', step: TOTP_STEP });

        await APITester.Test(ApiAccount.SetupTFA({ secret: test_tfa_secret, password: newPassword, token: tfaToken }), testUser.auth);

        const loginRes = await APITester.Test(ApiAuth.Login({ username: newUsername, password: newPassword, remember: true }), APIAuthentication.Unauthenticated());
        testUser.auth = new APIAuthentication(loginRes.session_id);

        const context = await APITester.Test(ApiAuth.GetContext(), testUser.auth);

        expect(context.tfa).to.be.equal(true);
    });

    it('Should disable two factor authentication', async () => {
        let tfaToken = speakeasy.totp({ secret: test_tfa_secret, encoding: 'base32', step: TOTP_STEP });
        await APITester.Test(ApiAuth.LoginTFA({token: tfaToken, captcha: ""}), testUser.auth);

        tfaToken = speakeasy.totp({ secret: test_tfa_secret, encoding: 'base32', step: TOTP_STEP });
        await APITester.Test(ApiAccount.RemoveTFA({ token: tfaToken}), testUser.auth);

        const context = await APITester.Test(ApiAuth.GetContext(), testUser.auth);

        expect(context.tfa).to.be.equal(false);
    });

    it('Should get active sessions', async () => {
        const activeSessionList = await APITester.Test(ApiAccount.GetSessions(), testUser.auth);

        expect(activeSessionList).not.be.equal(null);
    });

    let activeSessionList: SessionListItem[];

    it('Should get active sessions', async () => {
        activeSessionList = await APITester.Test(ApiAccount.GetSessions(), testUser.auth);

        expect(activeSessionList).not.be.equal(null);
        expect(activeSessionList.length).to.be.greaterThan(0);

        console.log(activeSessionList);
    });

    it('Should be able to close a session', async () => {
        await APITester.Test(ApiAccount.CloseSession(activeSessionList[0].session), testUser.auth);

        const context = await APITester.Test(ApiAuth.GetContext(), APIAuthentication.WithSession(activeSessionList[0].session));

        expect(context.status).to.be.equal("UNAUTHORIZED");
    });

    it('Should be able to close all sessions', async () => {
        await APITester.Test(ApiAccount.CloseAllSessions(), testUser3.auth);

        const context = await APITester.Test(ApiAuth.GetContext(), testUser3.auth);

        expect(context.status).to.be.equal("UNAUTHORIZED");
    });

    it('Should delete account for the test user', async () => {
        await APITester.Test(ApiAccount.DeleteAccount({ password: testUser2.password, tfa_token: "" }), testUser2.auth);

        await APITester.TestError(ApiAuth.Login({ username: testUser2.username, password: testUser2.password, remember: true }), APIAuthentication.Unauthenticated(), 403);
    });
});
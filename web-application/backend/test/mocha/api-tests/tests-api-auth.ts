// API tests

"use strict";

import { expect } from 'chai';
import { APITester } from '../test-tools/api-tester';
import { PreparedUser, TestUsers } from '../test-tools/models/users';
import { ApiAuth } from '../test-tools/api-bindings/api-group-auth';
import { APIAuthentication } from '../test-tools/authentication';

// Test group
describe("API / Authentication", () => {

    let testUser1: PreparedUser;

    before(async () => {
        // Setup test server (REQUIRED)
        await APITester.Initialize();

        // Setup users
        testUser1 = await TestUsers.NewRegularUser();
    });

    // Tests

    it('Should get the authentication context for the test user', async () => {
        const context = await APITester.Test(ApiAuth.GetContext(), testUser1.auth);

        expect(context.status).to.be.equal("LOGGED_IN");
        expect(context.email).to.be.equal(testUser1.email);
        expect(context.username).to.be.equal(testUser1.username);
    });

    it('Should fail to get the context if unauthenticated', async () => {
        const context = await APITester.Test(ApiAuth.GetContext(), APIAuthentication.Unauthenticated());

        expect(context.status).to.be.equal("UNAUTHORIZED");
    });

    let test_session: string;

    it('Should be able to login with the user\'s credentials', async () => {
        const loginRes = await APITester.Test(ApiAuth.Login({ username: testUser1.username, password: testUser1.password, remember: true }), APIAuthentication.Unauthenticated());

        expect(loginRes.uid).to.be.equal(testUser1.uid);

        test_session = loginRes.session_id;
    });

    it('Should fail to login with invalid credentials', async () => {
        await APITester.TestError(ApiAuth.Login({ username: testUser1.username, password: "this_is_an_invalid_password", remember: true }), APIAuthentication.Unauthenticated(), 403, "INVALID_CREDENTIALS");
    });

    it('Should be able to log out', async () => {
        await APITester.Test(ApiAuth.Logout(), testUser1.auth);
    });

    it('Should fail to get the context after the log out', async () => {
        const context = await APITester.Test(ApiAuth.GetContext(), testUser1.auth);

        expect(context.status).to.be.equal("UNAUTHORIZED");
    });
});


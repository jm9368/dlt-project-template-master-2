// API tests

"use strict";

import assert from "assert";
import { APITester } from '../test-tools/api-tester';
import { PreparedUser, TestUsers } from '../test-tools/models/users';
import { ApiRolesAdmin } from "../test-tools/api-bindings/api-group-roles-admin";
import { ApiUsersAdmin } from "../test-tools/api-bindings/api-group-users-admin";


// Test group
describe("API / Admin / Roles", () => {
    let testAdmin: PreparedUser;
    let testUser: PreparedUser;

    before(async () => {
        // Setup test server (REQUIRED)
        await APITester.Initialize();

        // Setup users
        testAdmin = await TestUsers.NewAdministrator();
        testUser = await TestUsers.NewRegularUser();
    });

    // Tests

    it('Should fail if called by unauthorized user', async () => {
        await APITester.TestError(ApiRolesAdmin.GetRoles(), testUser.auth, 403);
        await APITester.TestError(ApiRolesAdmin.CreateRole({ id: 'test', permissions: [] }), testUser.auth, 403);
        await APITester.TestError(ApiRolesAdmin.ModifyRole('-', { permissions: [] }), testUser.auth, 403);
        await APITester.TestError(ApiRolesAdmin.DeleteRole('test'), testUser.auth, 403);
        await APITester.TestError(ApiRolesAdmin.GetRoles(), testUser.auth, 403);
    });

    it('Should be able to list roles', async () => {
        const r = await APITester.Test(ApiRolesAdmin.GetRoles(), testAdmin.auth);

        assert.equal(r.length, 2);
    });

    it('Should be able to create a role', async () => {
        await APITester.Test(ApiRolesAdmin.CreateRole({ id: 'test', permissions: [] }), testAdmin.auth);

        const r = await APITester.Test(ApiRolesAdmin.GetRoles(), testAdmin.auth);

        assert.equal(r.length, 3);
        assert.equal(r[1].id, 'test');
    });

    it('Should be able to change the roles permissions', async () => {
        await APITester.Test(ApiRolesAdmin.ModifyRole('test', {
            permissions: [
                { id: "mod.users", granted: true },
                { id: "mod.immune", granted: true }
            ]
        }), testAdmin.auth);

        const r = await APITester.Test(ApiRolesAdmin.GetRoles(), testAdmin.auth);

        assert.equal(r.length, 3);
        assert.equal(r[1].id, 'test');
        assert(r[1].permissions.filter(p => p.granted).map(p => p.id).includes("mod.users"));
        assert(r[1].permissions.filter(p => p.granted).map(p => p.id).includes("mod.immune"));
    });

    it('Should be able to change the role of an user and affect their permissions', async () => {
        await APITester.Test(ApiUsersAdmin.SetRole(testUser.uid, { role: 'test' }), testAdmin.auth);

        const r = await APITester.Test(ApiUsersAdmin.GetUser(testUser.uid), testAdmin.auth);

        assert.equal(r.role, 'test');

        // Should be able to call a mod API

        await APITester.Test(ApiUsersAdmin.GetUsers({}), testUser.auth);
    });

    it('Should be able to delete a role', async () => {
        await APITester.Test(ApiRolesAdmin.DeleteRole('test'), testAdmin.auth);

        const r = await APITester.Test(ApiRolesAdmin.GetRoles(), testAdmin.auth);

        assert.equal(r.length, 2);
        assert(!r.map(r => r.id).includes("test"));
    });
});

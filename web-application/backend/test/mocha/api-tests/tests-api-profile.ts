// API tests

"use strict";

import assert from "assert";
import { APITester } from '../test-tools/api-tester';
import { PreparedUser, TestUsers } from '../test-tools/models/users';
import { ApiProfile } from "../test-tools/api-bindings/api-group-profile";
import { APIAuthentication } from "../test-tools/authentication";
import Path from "path";
import { readFileSync } from "fs";


// Test group
describe("API / Profile", () => {
    let testUser1: PreparedUser;

    before(async () => {
        // Setup test server (REQUIRED)
        await APITester.Initialize();

        // Setup users
        testUser1 = await TestUsers.NewRegularUser();
    });

    // Tests

    it('Should be able to the user profile by username', async () => {
        const r = await APITester.Test(ApiProfile.GetProfile('@' + testUser1.username), APIAuthentication.Unauthenticated());

        assert.equal(r.id, testUser1.uid);
        assert.equal(r.username, testUser1.username);
    });

    it('Should be able to the user profile by UID', async () => {
        const r = await APITester.Test(ApiProfile.GetProfile(testUser1.uid), APIAuthentication.Unauthenticated());

        assert.equal(r.id, testUser1.uid);
        assert.equal(r.username, testUser1.username);
    });

    it('Should fail if the user does not exists', async () => {
        await APITester.TestError(ApiProfile.GetProfile('@nonexistentuser'), APIAuthentication.Unauthenticated(), 404);
        await APITester.TestError(ApiProfile.GetProfile('invalid-user-id'), APIAuthentication.Unauthenticated(), 404);
    });

    const newName = "New profile name";
    const newBio = "Example bio";
    const newLocation = "Example location";
    const newWebsite = "https://www.example.com";

    it('Should be able to update the profile', async () => {
        await APITester.Test(ApiProfile.UpdateProfile({
            name: newName,
            bio: newBio,
            location: newLocation,
            website: newWebsite,
        }), testUser1.auth);

        const r = await APITester.Test(ApiProfile.GetProfile(testUser1.uid), APIAuthentication.Unauthenticated());

        assert.equal(r.id, testUser1.uid);
        assert.equal(r.username, testUser1.username);
        assert.equal(r.name, newName);
        assert.equal(r.bio, newBio);
        assert.equal(r.location, newLocation);
        assert.equal(r.website, newWebsite);
    });

    it('Should be able to update the profile image', async () => {
        await APITester.Test(ApiProfile.UpdateImage({
            image: readFileSync(Path.resolve(__dirname, "..", "..", "..", "..", "frontend", "src", "assets", "user.png")),
        }), testUser1.auth);

        const r = await APITester.Test(ApiProfile.GetProfile(testUser1.uid), APIAuthentication.Unauthenticated());

        assert.equal(r.id, testUser1.uid);
        assert.equal(r.username, testUser1.username);
        assert.equal(r.name, newName);
        assert.equal(r.bio, newBio);
        assert.equal(r.location, newLocation);
        assert.equal(r.website, newWebsite);

        const image = (r.image || "") + "";

        assert.notEqual(image, "");

        await APITester.Test({ url: image, method: "GET" }, APIAuthentication.Unauthenticated());
    });

    it('Should be able to delete the profile image', async () => {
        await APITester.Test(ApiProfile.DeleteImage(), testUser1.auth);

        const r = await APITester.Test(ApiProfile.GetProfile(testUser1.uid), APIAuthentication.Unauthenticated());

        assert.equal(r.id, testUser1.uid);
        assert.equal(r.username, testUser1.username);
        assert.equal(r.name, newName);
        assert.equal(r.bio, newBio);
        assert.equal(r.location, newLocation);
        assert.equal(r.website, newWebsite);
        assert.equal(r.image, "");
    });
});

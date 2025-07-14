// Function tests

"use strict";

import assert from "assert";
import { noCache, ensureObjectBody, OK, NOT_FOUND, UNAUTHORIZED, FORBIDDEN, BAD_REQUEST, INTERNAL_SERVER_ERROR, NOT_IMPLEMENTED, SERVICE_UNAVAILABLE } from "../../../src/utils/http-utils";

// Test group
describe("HTTP utilities", () => {
    it('Constants should match standardized values', async () => {
        assert.equal(OK, 200);

        assert.equal(NOT_FOUND, 404);
        assert.equal(UNAUTHORIZED, 401);
        assert.equal(FORBIDDEN, 403);
        assert.equal(BAD_REQUEST, 400);

        assert.equal(INTERNAL_SERVER_ERROR, 500);
        assert.equal(NOT_IMPLEMENTED, 501);
        assert.equal(SERVICE_UNAVAILABLE, 503);
    });

    it('noCache should set the Cache-Control header to the response', async () => {
        const fakeResponse = {
            headers: new Map<string, string>(),
            setHeader: function (name, value) {
                this.headers.set(name, value);
            },
        };

        let callbackCalled = false;

        await noCache((req, res) => {
            callbackCalled = true;

            assert.equal(req, null);
            assert.equal(res, fakeResponse);
        })(null, fakeResponse as any);

        assert(callbackCalled);

        assert.equal(fakeResponse.headers.get("Cache-Control"), "no-cache");
    });

    it('ensureObjectBody should always turn the request body into an object', async () => {
        const values = [
            undefined,
            null,
            "",
            "test",
            0,
            1,
            true,
            false,
            [],
            {},
            { test: true },
        ];

        for (let value of values) {
            const fakeRequest = {
                body: value,
            };

            let callbackCalled = false;

            await ensureObjectBody((req, res) => {
                callbackCalled = true;

                assert.equal(req, fakeRequest);
                assert.equal(res, null);
            })(fakeRequest as any, null as any);

            assert.equal(typeof fakeRequest.body, "object");
            assert.notEqual(fakeRequest.body, null);

            if (typeof value === "object" && value !== null) {
                assert.deepEqual(fakeRequest.body, value);
            }
        }
    });
});
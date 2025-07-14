// Function tests

"use strict";

import assert from 'assert';
import { sha256 } from "../../../src/utils/hash";

// Test group
describe("Hash utilities", () => {
    it('sha256', async () => {
        const payload = "Test payload";
        const payloadBuffer = Buffer.from(payload, "utf8");

        const h1 = sha256(payload);
        const h2 = sha256(payloadBuffer);

        assert.equal(h1, h2);
        assert.match(h1, /^[0-9a-z]{64}$/);
    });
});
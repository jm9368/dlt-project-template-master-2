// Function tests

"use strict";

import assert from 'assert';
import {  hexNoPrefix, hexWithPrefix } from "../../../src/utils/hex";

// Test group
describe("Hex utilities", () => {
    it('hexWithPrefix', async () => {
        let res: string;

        res = hexWithPrefix("0123456");

        assert(res.startsWith("0x"));
        assert.equal(res, "0x0123456");

        res = hexWithPrefix(res);

        assert.equal(res, "0x0123456");
    });

    it('hexNoPrefix', async () => {
        let res: string;

        res = hexNoPrefix("0x0123456");

        assert(!res.startsWith("0x"));
        assert.equal(res, "0123456");

        res = hexNoPrefix(res);

        assert.equal(res, "0123456");
    });
});
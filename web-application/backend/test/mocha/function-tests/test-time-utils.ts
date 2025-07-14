// Function tests

"use strict";

import assert from "assert";
import { formatDate } from "../../../src/utils/time-utils";

// Test group
describe("Time utilities", () => {
    it('formatDate', async () => {
        const date = Date.now();
        const formatted = formatDate(date);
        assert.match(formatted, /^[0-9]+-[0-9]{2}-[0-9]{2}\s[0-9]{2}:[0-9]{2}:[0-9]{2}/);
    });
});
// Function tests

"use strict";

import assert from 'assert';
import { isBigInteger, parseBigInteger, uintToId } from "../../../src/utils/bigint";

// Test group
describe("BigInteger", () => {
    it('isBigInteger', async () => {
        const testCases: { str: string, valid: boolean }[] = [
            { str: "0", valid: true },
            { str: "123", valid: true },
            { str: "-123", valid: true },
            { str: "1234567890", valid: true },
            { str: "0x0", valid: true },
            { str: "0xFF", valid: true },
            { str: "", valid: true },
            { str: "Invalid", valid: false },
            { str: "0.12345", valid: false },
            { str: "123.456789", valid: false },
        ];

        for (let c of testCases) {
            assert.equal(c.valid, isBigInteger(c.str), `Test case: ${c.str}`);
        }
    });

    it('parseBigInteger', async () => {
        const testCases: { str: string, parsed: bigint }[] = [
            { str: "0", parsed: BigInt(0) },
            { str: "123", parsed: BigInt(123) },
            { str: "-123", parsed: BigInt(-123) },
            { str: "1234567890", parsed: BigInt(1234567890) },
            { str: "0x0", parsed: BigInt(0x0) },
            { str: "0xFF", parsed: BigInt(0xFF) },
            { str: "", parsed: BigInt(0) },
            { str: "Invalid", parsed: BigInt(0) },
            { str: "0.12345", parsed: BigInt(0) },
            { str: "123.456789", parsed: BigInt(0) },
        ];

        for (let c of testCases) {
            assert.equal(c.parsed, parseBigInteger(c.str), `Test case: ${c.str}`);
        }
    });

    it('uintToId', async () => {
        const testCases: { b: bigint, size: number, result: string }[] = [
            { b: BigInt(0), size: 4, result: "0000" },
            { b: BigInt(1), size: 4, result: "0001" },
            { b: BigInt(1), size: 8, result: "00000001" },
            { b: BigInt(255), size: 8, result: "000000ff" },
        ];

        for (let c of testCases) {
            assert.equal(c.result, uintToId(c.b, c.size), `Test case: ${c.b.toString(10)}`);
        }
    });
});
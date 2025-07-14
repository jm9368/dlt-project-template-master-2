// Function tests

"use strict";

import Crypto from "crypto";
import assert from 'assert';
import { ZERO_ADDRESS, isZeroAddress, validateAddress, compareAddresses, compareBytes32, normalizeAddress, normalizeBytes32, validateBytes32, quantityToDecimalString, validateQuantityDecimalString, parseQuantityDecimalString } from "../../../src/utils/blockchain";

// Test group
describe("Blockchain utilities", () => {
    it('isZeroAddress', async () => {
        assert.equal(validateAddress(ZERO_ADDRESS), true);
        assert.equal(isZeroAddress(ZERO_ADDRESS), true);
        assert.equal(isZeroAddress("0xAb6355Ca5BC17C886b95f61EE601dD149F5C31B6"), false);
    });

    it('validateAddress', async () => {
        assert.equal(validateAddress("0x"), false);
        assert.equal(validateAddress("0x00"), false);
        assert.equal(validateAddress("0000000000000000000000000000000000000000"), true);
        assert.equal(validateAddress("0x0000000000000000000000000000000000000000"), true);
        assert.equal(validateAddress("0xAb6355Ca5BC17C886b95f61EE601dD149F5C31B6"), true);
    });

    it('normalizeAddress', async () => {
        const randomAddress = Crypto.randomBytes(20).toString("hex").toUpperCase();

        let res = normalizeAddress(randomAddress);

        assert.match(res, /^0x[0-9a-z]{40}$/);
    });

    it('compareAddresses', async () => {
        const randomAddress1 = Crypto.randomBytes(20).toString("hex").toUpperCase();
        const randomAddress2 = Crypto.randomBytes(20).toString("hex").toUpperCase();

        assert(compareAddresses(randomAddress1, "0x" + randomAddress1));
        assert(compareAddresses(randomAddress1.toLowerCase(), randomAddress1));
        assert(compareAddresses(randomAddress1, randomAddress2) === (randomAddress1 === randomAddress2));
    });

    it('normalizeBytes32', async () => {
        const randomBytes = Crypto.randomBytes(32).toString("hex").toUpperCase();

        let res = normalizeBytes32(randomBytes);

        assert.match(res, /^0x[0-9a-z]{64}$/);
    });

    it('compareBytes32', async () => {
        const bytes1 = Crypto.randomBytes(32).toString("hex").toUpperCase();
        const bytes2 = Crypto.randomBytes(32).toString("hex").toUpperCase();

        assert(compareBytes32(bytes1, "0x" + bytes1));
        assert(compareAddresses(bytes1.toLowerCase(), bytes1));
        assert(compareAddresses(bytes1, bytes2) === (bytes1 === bytes2));
    });

    it('validateBytes32', async () => {
        const randomBytes = Crypto.randomBytes(32).toString("hex").toUpperCase();

        assert(!validateBytes32(randomBytes));
        assert(!validateBytes32(randomBytes.toLowerCase()));
        assert(!validateBytes32(normalizeBytes32(randomBytes) + "a"));

        assert(validateBytes32("0x" + randomBytes));
        assert(validateBytes32(normalizeBytes32(randomBytes)));
    });

    it('quantityToDecimalString', async () => {
        const tests: {q: bigint, decimals: number, str: string}[] = [
            {q: BigInt("12345"), decimals: 0, str: "12345"},
            {q: BigInt("12345"), decimals: 1, str: "1234.5"},
            {q: BigInt("12345"), decimals: 2, str: "123.45"},
            {q: BigInt("12345"), decimals: 3, str: "12.345"},
            {q: BigInt("12345"), decimals: 5, str: "0.12345"},
            {q: BigInt("12345"), decimals: 7, str: "0.0012345"},
        ];

        for (let test of tests) {
            const r = quantityToDecimalString(test.q, test.decimals);
            assert.equal(r, test.str);
        }
    });

    it('parseQuantityDecimalString', async () => {
        const tests: {q: bigint, decimals: number, str: string}[] = [
            {q: BigInt("12345"), decimals: 0, str: "12345"},
            {q: BigInt("12345"), decimals: 1, str: "1234.5"},
            {q: BigInt("12345"), decimals: 2, str: "123.45"},
            {q: BigInt("12345"), decimals: 3, str: "12.345"},
            {q: BigInt("12345"), decimals: 5, str: "0.12345"},
            {q: BigInt("12345"), decimals: 7, str: "0.0012345"},
        ];

        for (let test of tests) {
            const r = parseQuantityDecimalString(test.str, test.decimals);
            assert.equal(r, test.q);
        }
    });

    it('validateQuantityDecimalString', async () => {
        const tests: {valid: boolean, decimals: number, str: string}[] = [
            {valid: true, decimals: 0, str: "12345"},
            {valid: true, decimals: 1, str: "1234.5"},
            {valid: true, decimals: 2, str: "123.45"},
            {valid: true, decimals: 3, str: "12.345"},
            {valid: true, decimals: 5, str: "0.12345"},
            {valid: true, decimals: 7, str: "0.0012345"},
            {valid: false, decimals: 4, str: "0.0012345"},
            {valid: false, decimals: 4, str: "Invalid"},
        ];

        for (let test of tests) {
            const r = validateQuantityDecimalString(test.str, test.decimals);
            assert.equal(r, test.valid);
        }
    });
});
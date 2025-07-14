// Function tests

"use strict";

import Crypto from "crypto";
import { expect } from 'chai';
import { encrypt, decrypt } from "../../../src/utils/aes";

// Test group
describe("AES", () => {
    const message = "Test message " + Crypto.randomBytes(8).toString("hex");
    const password = Crypto.randomBytes(24).toString("hex");

    let encrypted: string;

    it('Should be able to encrypt a message', async () => {
        encrypted = encrypt(message, password);
    });

    it('Should be able to decrypt a message', async () => {
        const decryptedMessage = decrypt(encrypted, password).toString("utf-8");

        expect(decryptedMessage).to.be.equal(message);
    });
});
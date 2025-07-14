// API tests

"use strict";

import assert from "assert";
import Crypto from "crypto";
import { APITester } from '../test-tools/api-tester';
import { PreparedUser, TestUsers } from '../test-tools/models/users';
import { ApiWallet } from '../test-tools/api-bindings/api-group-wallet';
import { privateKeyToAddress } from '@asanrom/smart-contract-wrapper';


// Test group
describe("API / Wallets", () => {
    let testUser1: PreparedUser;

    before(async () => {
        // Setup test server (REQUIRED)
        await APITester.Initialize();

        // Setup users
        testUser1 = await TestUsers.NewRegularUser();
    });

    // Tests

    const randomPassword = Crypto.randomBytes(8).toString("hex");
    let wallet1: string;
    let wallet2: string;

    it('Should be able to create a wallet', async () => {
        const r = await APITester.Test(ApiWallet.CreateWallet({ name: "Wallet 1", password: randomPassword }), testUser1.auth);

        assert.equal(r.name, "Wallet 1");

        wallet1 = r.id;
    });

    const randomPrivateKey = Crypto.randomBytes(32);
    const randomPrivateKeyAddress = privateKeyToAddress(randomPrivateKey);

    it('Should be able to create a wallet with a private key', async () => {
        const r = await APITester.Test(ApiWallet.CreateWallet({ name: "Wallet 2", password: randomPassword, private_key: randomPrivateKey.toString("hex") }), testUser1.auth);

        assert.equal(r.name, "Wallet 2");
        assert.equal((r.address || "").toLowerCase(), randomPrivateKeyAddress.toLowerCase());

        wallet2 = r.id;
    });

    it('Should be able to list the wallets', async () => {
        const wallets = await APITester.Test(ApiWallet.ListWallets(), testUser1.auth);

        assert.equal(wallets.length, 2);
    });

    it('Should be able to change the wallet name', async () => {
        await APITester.Test(ApiWallet.ModifyWallet(wallet1, { name: "Wallet 1 (M)" }), testUser1.auth);

        const wallet = await APITester.Test(ApiWallet.GetWallet(wallet1), testUser1.auth);

        assert.equal(wallet.name, "Wallet 1 (M)");
    });

    const randomPassword2 = Crypto.randomBytes(8).toString("hex");

    it('Should be able to change the wallet password', async () => {
       // Should fail if the password is wrong
       await APITester.TestError(ApiWallet.ChangeWalletPassword(wallet1, {password: "Invalid", new_password: randomPassword2}), testUser1.auth, 400, "WRONG_PASSWORD");

       // Success if correct password
       await APITester.Test(ApiWallet.ChangeWalletPassword(wallet1, {password: randomPassword, new_password: randomPassword2}), testUser1.auth)
    });

    it('Should be able to export the private key', async () => {
        // Should fail if wrong password
        await APITester.TestError(ApiWallet.ExportPrivatekey(wallet1, {password: "Invalid"}), testUser1.auth, 400, "WRONG_PASSWORD");

        // Success if correct password
        await APITester.Test(ApiWallet.ExportPrivatekey(wallet1, {password: randomPassword2}), testUser1.auth);

        const r = await APITester.Test(ApiWallet.ExportPrivatekey(wallet2, {password: randomPassword}), testUser1.auth);

        assert.equal(r.private_key.toUpperCase(), randomPrivateKey.toString("hex").toUpperCase());
    });

    it('Should be able to delete a wallet', async () => {
        await APITester.Test(ApiWallet.DeleteWallet(wallet1), testUser1.auth);

        await APITester.TestError(ApiWallet.GetWallet(wallet1), testUser1.auth, 404);

        const wallets = await APITester.Test(ApiWallet.ListWallets(), testUser1.auth);

        assert.equal(wallets.length, 1);
    });
});

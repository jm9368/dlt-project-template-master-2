/* Tests for fungible token ERC721 */

'use strict';

const ERC721 = artifacts.require("./ERC721.sol");
const TestERC721Receiver = artifacts.require("./TestERC721Receiver.sol");

const assert = require("assert");

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

const TEST_HASH_1 = "0x23f01564edc9181a0522b51349fc35ea2d604715b4112f9be328e6dfe2faa301";
const TEST_HASH_2 = "0x23f01564edc9181a0522b51349fc35ea2d604715b4112f9be328e6dfe2faa302";
const TEST_HASH_3 = "0x23f01564edc9181a0522b51349fc35ea2d604715b4112f9be328e6dfe2faa303";

function toNumber(n) {
    return Number(n.toString(10));
}

contract("ERC721", accounts => {
    const root = accounts[0];

    const account1 = accounts[1];
    const account2 = accounts[2];
    const account3 = accounts[3];

    it("Should fetch the correct metadata from the deploy script", async () => {
        const erc721 = await ERC721.deployed();

        const name = await erc721.name.call();
        const symbol = await erc721.symbol.call();
        const baseURI = await erc721.baseURI.call();

        assert.equal(name, "TestNotFungible");
        assert.equal(symbol, "TNFT");
        assert.equal(baseURI, "http://localhost/");
    });

    it("Should be able to modify the contract metadata", async () => {
        const erc721 = await ERC721.deployed();

        await erc721.updateContractMetadata("TestChangedNFT", "NFT", "https://nft.test.com/");

        const name = await erc721.name.call();
        const symbol = await erc721.symbol.call();
        const baseURI = await erc721.baseURI.call();

        assert.equal(name, "TestChangedNFT");
        assert.equal(symbol, "NFT");
        assert.equal(baseURI, "https://nft.test.com/");
    });

    it("Should return the correct values if token does not exist", async () => {
        const erc721 = await ERC721.deployed();

        const ownerOf = await erc721.ownerOf.call(1);
        assert.equal(ownerOf, ZERO_ADDRESS);

        const tokenURI = await erc721.tokenURI.call(1);
        assert.equal(tokenURI, "");
    });

    it("Should be able to mint tokens", async () => {
        const erc721 = await ERC721.deployed();

        // Should fail if not root

        let failed = false;

        try {
            await erc721.mint(root, TEST_HASH_1, { from: account1 });
        } catch (ex) {
            failed = true;
        }

        assert.equal(failed, true);

        // Mint

        let ownerOf;
        let balance;
        let tokenURI;
        let tokenHash;

        await erc721.mint(root, TEST_HASH_1, { from: root });

        ownerOf = await erc721.ownerOf.call(1);
        assert.equal(ownerOf, root);

        balance = toNumber(await erc721.balanceOf.call(root));
        assert.equal(balance, 1);

        tokenURI = await erc721.tokenURI.call(1);
        assert.equal(tokenURI, "https://nft.test.com/1");

        tokenHash = await erc721.tokenHash.call(1);
        assert.equal(tokenHash, TEST_HASH_1);

        await erc721.mint(account1, TEST_HASH_2, { from: root });

        ownerOf = await erc721.ownerOf.call(2);
        assert.equal(ownerOf, account1);

        balance = toNumber(await erc721.balanceOf.call(account1));
        assert.equal(balance, 1);

        tokenURI = await erc721.tokenURI.call(2);
        assert.equal(tokenURI, "https://nft.test.com/2");

        tokenHash = await erc721.tokenHash.call(2);
        assert.equal(tokenHash, TEST_HASH_2);

        await erc721.mint(account1, TEST_HASH_3, { from: root });

        ownerOf = await erc721.ownerOf.call(3);
        assert.equal(ownerOf, account1);

        balance = toNumber(await erc721.balanceOf.call(account1));
        assert.equal(balance, 2);

        tokenURI = await erc721.tokenURI.call(3);
        assert.equal(tokenURI, "https://nft.test.com/3");

        tokenHash = await erc721.tokenHash.call(3);
        assert.equal(tokenHash, TEST_HASH_3);

        // Total should be updated

        const totalMinted = toNumber(await erc721.tokensMintedCount.call());
        assert.equal(totalMinted, 3);

        const marketLength = toNumber(await erc721.marketLength.call());
        assert.equal(marketLength, 3);
    });

    it("Should be able to transfer a token (by the owner)", async () => {
        const erc721 = await ERC721.deployed();

        // Should fail if not the owner

        let failed = false;

        try {
            await erc721.transferFrom(root, account2, 1, { from: account1 });
        } catch (ex) {
            failed = true;
        }

        assert.equal(failed, true);

        // Transfer

        await erc721.transferFrom(account1, account2, 3, { from: account1 });

        let ownerOf;
        let balance;

        ownerOf = await erc721.ownerOf.call(3);
        assert.equal(ownerOf, account2);

        balance = toNumber(await erc721.balanceOf.call(account1));
        assert.equal(balance, 1);

        balance = toNumber(await erc721.balanceOf.call(account2));
        assert.equal(balance, 1);
    });

    it("Should be able to burn a token", async () => {
        const erc721 = await ERC721.deployed();

        // Should fail if not the owner

        let failed = false;

        try {
            await erc721.burn(root, 1, { from: account1 });
        } catch (ex) {
            failed = true;
        }

        assert.equal(failed, true);

        // Burn token

        const TEST_TOKEN = 3;

        await erc721.burn(account2, TEST_TOKEN, { from: account2 });

        let ownerOf;
        let balance;

        ownerOf = await erc721.ownerOf.call(3);
        assert.equal(ownerOf, ZERO_ADDRESS);

        balance = toNumber(await erc721.balanceOf.call(account1));
        assert.equal(balance, 1);

        balance = toNumber(await erc721.balanceOf.call(account2));
        assert.equal(balance, 0);

        const tokenURI = await erc721.tokenURI.call(TEST_TOKEN);
        assert.equal(tokenURI, "");

        // Total updated
        const totalMinted = toNumber(await erc721.tokensMintedCount.call());
        assert.equal(totalMinted, 3);

        const marketLength = toNumber(await erc721.marketLength.call());
        assert.equal(marketLength, 2);
    });

    it("Should be able to approve an account to transfer a token", async () => {
        const erc721 = await ERC721.deployed();

        // Should fail if not the owner

        let failed = false;

        try {
            await erc721.approve(account2, 1, { from: account1 });
        } catch (ex) {
            failed = true;
        }

        assert.equal(failed, true);

        // Approve

        let approved;

        const TEST_TOKEN = 2;

        approved = await erc721.getApproved.call(TEST_TOKEN);
        assert.equal(approved, ZERO_ADDRESS);

        await erc721.approve(account2, TEST_TOKEN, { from: account1 });

        approved = await erc721.getApproved.call(TEST_TOKEN);
        assert.equal(approved, account2);

        // Transfer

        await erc721.transferFrom(account1, account2, TEST_TOKEN, { from: account2 });

        approved = await erc721.getApproved.call(TEST_TOKEN);
        assert.equal(approved, ZERO_ADDRESS);

        let ownerOf;
        let balance;

        ownerOf = await erc721.ownerOf.call(TEST_TOKEN);
        assert.equal(ownerOf, account2);

        balance = toNumber(await erc721.balanceOf.call(account1));
        assert.equal(balance, 0);

        balance = toNumber(await erc721.balanceOf.call(account2));
        assert.equal(balance, 1);
    });

    it("Should be able to approve an operator for an account", async () => {
        const erc721 = await ERC721.deployed();

        const TEST_TOKEN = 2;

        let isApproved;
        let ownerOf;
        let balance;

        isApproved = await erc721.isApprovedForAll.call(account2, account3);
        assert.equal(isApproved, false);

        // Approve

        await erc721.setApprovalForAll(account3, true, {from: account2});

        isApproved = await erc721.isApprovedForAll.call(account2, account3);
        assert.equal(isApproved, true);

        // Transfer

        await erc721.transferFrom(account2, account1, TEST_TOKEN, {from: account3});

        ownerOf = await erc721.ownerOf.call(TEST_TOKEN);
        assert.equal(ownerOf, account1);

        balance = toNumber(await erc721.balanceOf.call(account1));
        assert.equal(balance, 1);

        balance = toNumber(await erc721.balanceOf.call(account2));
        assert.equal(balance, 0);

        // Transfer back

        await erc721.transferFrom(account1, account2, TEST_TOKEN, {from: account1});

        // Unapprove

        await erc721.setApprovalForAll(account3, false, {from: account2});

        isApproved = await erc721.isApprovedForAll.call(account2, account3);
        assert.equal(isApproved, false);

        // Now it should fail

        let failed = false;

        try {
            await erc721.transferFrom(account2, account1, TEST_TOKEN, {from: account3});
        } catch(ex) {
            failed = true;
        }

        assert.equal(failed, true);
    });

    it("Should be able to use safeTransferFrom (Transfer to a receiver contract)", async () => {
        const erc721 = await ERC721.deployed();
        await TestERC721Receiver.deployed();

        const TEST_TOKEN = 2;

        await erc721.safeTransferFrom(account2, TestERC721Receiver.address, TEST_TOKEN, {from: account2});

        let ownerOf;
        let balance;

        ownerOf = await erc721.ownerOf.call(TEST_TOKEN);
        assert.equal(ownerOf, TestERC721Receiver.address);

        balance = toNumber(await erc721.balanceOf.call(TestERC721Receiver.address));
        assert.equal(balance, 1);

        balance = toNumber(await erc721.balanceOf.call(account2));
        assert.equal(balance, 0);
    });
});

/* Tests for Ownable */

'use strict';

const ERC20 = artifacts.require("./ERC20.sol");
const ERC721 = artifacts.require("./ERC721.sol");

const assert = require("assert");

contract("Ownable", accounts => {
    const root = accounts[0];
    const account1 = accounts[1];

    /* ERC20 */

    it("[ERC20] Should properly init in constructor", async () => {
        const erc20 = await ERC20.deployed();

        let contractRoot = await erc20.root.call();
        assert.equal(contractRoot, root);
    });

    it("[ERC20] Should allow root transfer", async () => {
        const erc20 = await ERC20.deployed();

        await erc20.transferRoot(account1, {from: root});

        let contractRoot = await erc20.root.call();
        assert.equal(contractRoot, account1);

        await erc20.transferRoot(root, {from: account1});

        contractRoot = await erc20.root.call();
        assert.equal(contractRoot, root);
    });

    it("[ERC20] Should fail to transfer root if not called by root", async () => {
        const erc20 = await ERC20.deployed();

        let failed = false;

        try {
            await erc20.transferRoot(root, {from: account1});
        } catch (ex) {
            failed = true;
        }

        assert.equal(failed, true);
    });

    /* ERC721 */

    it("[ERC721] Should properly init in constructor", async () => {
        const erc721 = await ERC721.deployed();

        let contractRoot = await erc721.root.call();
        assert.equal(contractRoot, root);
    });

    it("[ERC721] Should allow root transfer", async () => {
        const erc721 = await ERC721.deployed();

        await erc721.transferRoot(account1, {from: root});

        let contractRoot = await erc721.root.call();
        assert.equal(contractRoot, account1);

        await erc721.transferRoot(root, {from: account1});

        contractRoot = await erc721.root.call();
        assert.equal(contractRoot, root);
    });

    it("[ERC721] Should fail to transfer root if not called by root", async () => {
        const erc721 = await ERC721.deployed();

        let failed = false;

        try {
            await erc721.transferRoot(root, {from: account1});
        } catch (ex) {
            failed = true;
        }

        assert.equal(failed, true);
    });
});

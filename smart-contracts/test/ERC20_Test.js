/* Tests for fungible token ERC20 */

'use strict';

const ERC20 = artifacts.require("./ERC20.sol");

const assert = require("assert");

function toNumber(n) {
    return Number(n.toString(10));
}

contract("ERC20", accounts => {
    const root = accounts[0];

    const account1 = accounts[1];
    const account2 = accounts[2];

    it("Should fetch the correct metadata from the deploy script", async () => {
        const erc20 = await ERC20.deployed();

        const name = await erc20.name.call();
        const symbol = await erc20.symbol.call();
        const decimals = toNumber(await erc20.decimals.call());

        assert.equal(name, "TestFungible");
        assert.equal(symbol, "TFT");
        assert.equal(decimals, 0);
    });

    it("Should be able to modify the contract metadata", async () => {
        const erc20 = await ERC20.deployed();

        await erc20.updateContractMetadata("TestChanged", "TC", 2, {from: root});

        const name = await erc20.name.call();
        const symbol = await erc20.symbol.call();
        const decimals = toNumber(await erc20.decimals.call());

        assert.equal(name, "TestChanged");
        assert.equal(symbol, "TC");
        assert.equal(decimals, 2);
    });

    it("Should be able to mint tokens", async () => {
        const erc20 = await ERC20.deployed();

        // Should fail if not root

        let failed = false;

        try {
            await erc20.mint(root, 500, {from: account1});
        } catch (ex) {
            failed = true;
        }

        assert.equal(failed, true);

        // Mint and check

        let balance = 0;

        await erc20.mint(root, 500, {from: root});
        balance = toNumber(await erc20.balanceOf.call(root));
        assert.equal(balance, 500);

        await erc20.mint(root, 500, {from: root});
        balance = toNumber(await erc20.balanceOf.call(root));
        assert.equal(balance, 1000);

        await erc20.mint(account1, 200, {from: root});
        balance = toNumber(await erc20.balanceOf.call(account1))
        assert.equal(balance, 200);

        await erc20.mint(account2, 300, {from: root});
        balance = toNumber(await erc20.balanceOf.call(account2));
        assert.equal(balance, 300);

        let total = toNumber(await erc20.totalSupply.call());

        assert.equal(total, 1500);
    });

    it("Should be able to transfer tokens", async () => {
        const erc20 = await ERC20.deployed();

        await erc20.transfer(account2, 100, {from: account1});

        let balance = 0;

        balance = toNumber(await erc20.balanceOf.call(account1))
        assert.equal(balance, 100);

        balance = toNumber(await erc20.balanceOf.call(account2))
        assert.equal(balance, 400);
    });

    it("Should be able to burn tokens", async () => {
        const erc20 = await ERC20.deployed();

        await erc20.burn(100, {from: account2});

        let balance = toNumber(await erc20.balanceOf.call(account2))
        assert.equal(balance, 300);

        let total = toNumber(await erc20.totalSupply.call());

        assert.equal(total, 1400);
    });

    it("Should be able to approve other account", async () => {
        const erc20 = await ERC20.deployed();

        await erc20.approve(account1, 100, {from: account2});

        let allowance = toNumber(await erc20.allowance.call(account2, account1));;

        assert.equal(allowance, 100);
    });

    it("Should be able to use transferFrom is allowed", async () => {
        const erc20 = await ERC20.deployed();

        // Should fail if the amount is greater than the allowed

        let failed = false;

        try {
            await erc20.transferFrom(account2, root, 200, {from: account1});
        } catch (ex) {
            failed = true;
        }

        assert.equal(failed, true);

        // Should fail if not allowed

        failed = false;

        try {
            await erc20.transferFrom(account2, root, 100, {from: root});
        } catch (ex) {
            failed = true;
        }

        assert.equal(failed, true);

        // Transfer

        await erc20.transferFrom(account2, root, 100, {from: account1});

        let balance = 0;

        balance = toNumber(await erc20.balanceOf.call(root))
        assert.equal(balance, 1100);

        balance = toNumber(await erc20.balanceOf.call(account2))
        assert.equal(balance, 200);
    });

    it("Should be able to increase allowance", async () => {
        const erc20 = await ERC20.deployed();

        await erc20.increaseAllowance(account1, 10, {from: account2});

        let allowance = toNumber(await erc20.allowance.call(account2, account1));;

        assert.equal(allowance, 10);

        await erc20.increaseAllowance(account1, 15, {from: account2});

        allowance = toNumber(await erc20.allowance.call(account2, account1));;

        assert.equal(allowance, 25);
    });

    it("Should be able to decrease allowance", async () => {
        const erc20 = await ERC20.deployed();

        await erc20.decreaseAllowance(account1, 5, {from: account2});

        let allowance = toNumber(await erc20.allowance.call(account2, account1));;

        assert.equal(allowance, 20);
    });
});

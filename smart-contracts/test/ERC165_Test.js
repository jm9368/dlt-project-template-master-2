/* Tests for ERC165 */

'use strict';

const ERC721 = artifacts.require("./ERC721.sol");

const assert = require("assert");

contract("ERC165", accounts => {
    /* ERC721 */

    it("[ERC721] Should implement ERC165", async () => {
        const erc721 = await ERC721.deployed();

        let implemented = await erc721.supportsInterface.call("0x01ffc9a7");
        assert.equal(implemented, true);
    });

});

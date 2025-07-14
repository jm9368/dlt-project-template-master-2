/* Contract deployment */

'use strict';

const ERC20 = artifacts.require("./ERC20.sol");
const ERC721 = artifacts.require("./ERC721.sol");
const TestERC721Receiver = artifacts.require("./TestERC721Receiver.sol");


module.exports = async function (deployer) {
    // Deploy ERC20
    await deployer.deploy(
        ERC20,
        "TestFungible",
        "TFT",
        0,
    );

    // Deploy ERC721
    await deployer.deploy(
        ERC721,
        "TestNotFungible",
        "TNFT",
        "http://localhost/",
    );

    // Deploy TestERC721Receiver
    await deployer.deploy(
        TestERC721Receiver,
        ERC721.address,
    );
};

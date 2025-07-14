// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

/**
 * Simple ownable
 */
contract Ownable {
    address public root; // Owner of the contract, the creator

    /**
     * Root change event
     * @param _root New root address
     */
    event RootChanged (address _root);

    /* Modifier to check the sender is root */
    modifier onlyRoot() {
        require(root == msg.sender, 'Must be root');
        _;
    }

    /**
     * Init function (call in constructor)
     */
    function _init_ownable() internal {
        root = msg.sender;

        emit RootChanged(root);
    }

    /**
     * Transfers the ownership of the smart contract.
     * @param _address The address to transfer the ownership.
     */
    function transferRoot(address _address) public onlyRoot {
        root = _address;

        emit RootChanged(_address);
    }
}

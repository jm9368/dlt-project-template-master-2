// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "./IERC721Receiver.sol";

/**
 * Test ERC721 receiver contract.
 * You can use this contract to test safeTransferFrom of ERC721
 */
contract TestERC721Receiver {
    address private _erc721_addr;

    /**
     * Token received event
     * @param operator The operator address
     * @param from The previous owner of the token
     * @param tokenId The ID of the token
     * @param data The data sent
     */
    event TokenReceived(
        address operator,
        address from,
        uint256 tokenId,
        bytes data
    );

    /**
     * Constructor
     * @param erc721_addr_ Address of the ERC721 token
     */
    constructor(address erc721_addr_) {
        _erc721_addr = erc721_addr_;
    }

    /**
     * Receive token
     * @param operator The operator address
     * @param from The previous owner of the token
     * @param tokenId The ID of the token
     * @param data The data sent
     */
    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes calldata data
    ) public returns (bytes4) {
        require(msg.sender == _erc721_addr, "Not ERC721 contract");

        emit TokenReceived(operator, from, tokenId, data);

        return IERC721Receiver.onERC721Received.selector;
    }
}

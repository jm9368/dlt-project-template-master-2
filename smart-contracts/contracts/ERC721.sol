// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "./IERC721.sol";
import "./IERC721Receiver.sol";
import "./IERC721Metadata.sol";
import "./Context.sol";
import "./ERC165.sol";
import "./Strings.sol";
import "./Ownable.sol";

/**
 * Generic contract for not fungible tokens (NFTs).
 * Standard name: ERC721
 */
contract ERC721 is Ownable, Context, ERC165, IERC721, IERC721Metadata {
    using Strings for uint256;

    /* Contract data */

    // Token counter for minting
    uint256 private _token_count;
    
    // Token name
    string private _name;

    // Token symbol
    string private _symbol;

    // Base URI
    string private _base_uri;

    // Mapping from token ID to owner address
    mapping(uint256 => address) private _owners;

    // Mapping owner address to token count
    mapping(address => uint256) private _balances;

    // Mapping from token ID to approved address
    mapping(uint256 => address) private _tokenApprovals;

    // Mapping from owner to operator approvals
    mapping(address => mapping(address => bool)) private _operatorApprovals;

    // Mapping for each token, the hash of the associated information
    mapping(uint256 => bytes32) private _hashes;

    /* Internal functions */

    /**
     * Gets the owner of a token
     * @param tokenId Token ID
     * @return address The token owner
     */
    function _ownerOf(uint256 tokenId) internal view virtual returns (address) {
        return _owners[tokenId];
    }

    /**
     * Checks if a token exists
     * @param tokenId Token ID
     * @return bool True only if the token exists
     */
    function _exists(uint256 tokenId) internal view virtual returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }

    /**
     * Generates a new Id for minting a token, incrementing _token_count
     * @return uint256 The token ID
     */
    function _generateTokenId() internal returns (uint256) {
        _token_count++;
        return _token_count;
    }

    /**
     * Checks if an account is approved to transfer a token
     * @param spender The account
     * @param tokenId The token ID
     * @return bool True only if the spender is approved or owns the token
     */
    function _isApprovedOrOwner(address spender, uint256 tokenId) internal view virtual returns (bool) {
        address owner = ERC721.ownerOf(tokenId);
        return (spender == owner || isApprovedForAll(owner, spender) || getApproved(tokenId) == spender);
    }

    /**
     * @dev Transfers `tokenId` from `from` to `to`.
     *  As opposed to {transferFrom}, this imposes no restrictions on msg.sender.
     *
     * Requirements:
     *
     * - `to` cannot be the zero address.
     * - `tokenId` token must be owned by `from`.
     *
     * Emits a {Transfer} event.
     */
    function _transfer(address from, address to, uint256 tokenId) internal virtual {
        require(_owners[tokenId] == from, "ERC721: transfer from incorrect owner");

        // Clear approvals from the previous owner
        delete _tokenApprovals[tokenId];

        unchecked {
            // `_balances[from]` cannot overflow for the same reason as described in `_burn`:
            // `from`'s balance is the number of token held, which is at least one before the current
            // transfer.
            // `_balances[to]` could overflow in the conditions described in `_mint`. That would require
            // all 2**256 token ids to be minted, which in practice is impossible.
            _balances[from] -= 1;
            _balances[to] += 1;
        }

        // Change owner
        _owners[tokenId] = to;

        emit Transfer(from, to, tokenId);
    }

    /**
     * @dev Internal function to invoke {IERC721Receiver-onERC721Received} on a target address.
     * The call is not executed if the target address is not a contract.
     *
     * @param from address representing the previous owner of the given token ID
     * @param to target address that will receive the tokens
     * @param tokenId uint256 ID of the token to be transferred
     * @param data bytes optional data to send along with the call
     * @return bool whether the call correctly returned the expected magic value
     */
    function _checkOnERC721Received(
        address from,
        address to,
        uint256 tokenId,
        bytes memory data
    ) private returns (bool) {
        if (to.code.length > 0) {
            try IERC721Receiver(to).onERC721Received(_msgSender(), from, tokenId, data) returns (bytes4 retval) {
                return retval == IERC721Receiver.onERC721Received.selector;
            } catch (bytes memory reason) {
                if (reason.length == 0) {
                    revert("ERC721: transfer to non ERC721Receiver implementer");
                } else {
                    /// @solidity memory-safe-assembly
                    assembly {
                        revert(add(32, reason), mload(reason))
                    }
                }
            }
        } else {
            return true;
        }
    }

     /**
     * @dev Mints `tokenId` and transfers it to `to`.
     *
     * WARNING: Usage of this method is discouraged, use {_safeMint} whenever possible
     *
     * Requirements:
     *
     * - `tokenId` must not exist.
     * - `to` cannot be the zero address.
     *
     * Emits a {Transfer} event.
     */
    function _mint(address to, uint256 tokenId) internal virtual {
        require(to != address(0), "ERC721: mint to the zero address");
        require(!_exists(tokenId), "ERC721: token already minted");

        unchecked {
            // Will not overflow unless all 2**256 token ids are minted to the same owner.
            // Given that tokens are minted one by one, it is impossible in practice that
            // this ever happens. Might change if we allow batch minting.
            // The ERC fails to describe this case.
            _balances[to] += 1;
        }

        _owners[tokenId] = to;

        emit Transfer(address(0), to, tokenId);
    }

    /* Constructor */

    /**
     * Constructor
     * @param name_ Token name
     * @param symbol_ Token symbol
     * @param base_uri_ Token base URI
     */
    constructor(string memory name_, string memory symbol_, string memory base_uri_) {
        _init_ownable();
        _name = name_;
        _symbol = symbol_;
        _base_uri = base_uri_;
        _token_count = 0;
    }

    /* View functions */

    /**
     * Checks if the contract supports a standard interface.
     * Defined in IERC165.
     * @param interfaceId ID of the interface
     * @return bool True only if the contract supports the interface
     */
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC165, IERC165) returns (bool) {
        return
            interfaceId == type(IERC721).interfaceId ||
            interfaceId == type(IERC721Metadata).interfaceId ||
            super.supportsInterface(interfaceId);
    }

    /**
     * Checks the number of tokens ever minted.
     * @return uint256 The number of tokens minted
     */
    function tokensMintedCount() public view returns (uint256) {
        return _token_count;
    }

    /**
     * Checks the number of tokens in circulation (Total minted - total burned).
     * @return uint256 The number of tokens in circulation
     */
    function marketLength() public view returns (uint256) {
        return _token_count - _balances[address(0)];
    }

    /**
     * Checks the number of tokens an accounts owns.
     * Defined in IERC721.
     * @param owner Account
     * @return uint256 The number of tokens owned
     */
    function balanceOf(address owner) public view virtual override returns (uint256) {
        return _balances[owner];
    }

    /**
     * Checks what account owns a specific token.
     * Defined in IERC721.
     * @param tokenId The token ID
     * @return address The token owner address (0 means the token does not exists or was burned)
     */
    function ownerOf(uint256 tokenId) public view virtual override returns (address) {
        address owner = _ownerOf(tokenId);
        return owner;
    }

    /**
     * Gets the token name.
     * Defined in IERC721Metadata.
     * @return string The token name
     */
    function name() public view virtual override returns (string memory) {
        return _name;
    }

    /**
     * Gets the token symbol.
     * Defined in IERC721Metadata.
     * @return string The token symbol
     */
    function symbol() public view virtual override returns (string memory) {
        return _symbol;
    }

    /**
     * Gets the base URI
     * @return string The base URI
     */
    function baseURI() public view returns (string memory) {
        return _base_uri;
    }

    /**
     * Gets the URI for a token.
     * Defined in IERC721Metadata.
     * @param tokenId The token ID
     * @return string The token URI
     */
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        if (!_exists(tokenId)) {
            return "";
        }
        return string(abi.encodePacked(_base_uri, tokenId.toString()));
    }

    /**
     * Gets the hash for a token.
     * @param tokenId The token ID
     * @return bytes32 The token hash
     */
    function tokenHash(uint256 tokenId) public view returns (bytes32) {
        return _hashes[tokenId];
    }

    /**
     * Gets the approved account for a token.
     * Defined in IERC721.
     * @param tokenId The token ID
     * @return address The approved account
     */
    function getApproved(uint256 tokenId) public view virtual override returns (address) {
        return _tokenApprovals[tokenId];
    }

    /**
     * Gets the approved account for all the tokens owned by an account.
     * Defined in IERC721.
     * @param owner The account owner
     * @return operator The account approved operator
     */
    function isApprovedForAll(address owner, address operator) public view virtual override returns (bool) {
        return _operatorApprovals[owner][operator];
    }

    /* Transaction functions */
    
    /**
     * Approves an account to manage a token.
     * Must be the owner of the token, or an operator for such account.
     * Defined in IERC721.
     * @param to The approved account
     * @param tokenId The token ID
     */
    function approve(address to, uint256 tokenId) public virtual override {
        address owner = _ownerOf(tokenId);
        require(to != owner, "ERC721: approval to current owner");

        require(
            _msgSender() == owner || isApprovedForAll(owner, _msgSender()),
            "ERC721: approve caller is not token owner or approved for all"
        );

        _tokenApprovals[tokenId] = to;
        emit Approval(owner, to, tokenId);
    }

    /**
     * Approves an account to operate in behalf of you to manage your tokens.
     * Defined in IERC721.
     * @param operator The account you want to approve
     * @param approved True if approved, false to revoke
     */
    function setApprovalForAll(address operator, bool approved) public virtual override {
        address owner = _msgSender();
        require(owner != operator, "ERC721: approve to caller");
        _operatorApprovals[owner][operator] = approved;
        emit ApprovalForAll(owner, operator, approved);
    }
    
    /**
     * Transfers a token.
     * Defined in IERC721.
     * @param from Owner of the token
     * @param to Destination of the token
     * @param tokenId The token ID
     */
    function transferFrom(address from, address to, uint256 tokenId) public virtual override {
        require(from != address(0), "ERC721: transfer from the zero address");
        require(to != address(0), "ERC721: transfer to the zero address");
        require(_isApprovedOrOwner(_msgSender(), tokenId), "ERC721: caller is not token owner or approved");

        _transfer(from, to, tokenId);
    }

    /**
     * Transfers a token to a receiver contract.
     * Defined in IERC721.
     * @param from Owner of the token
     * @param to Destination of the token (Must be a contract implementing IERC721Receiver)
     * @param tokenId The token ID
     */
    function safeTransferFrom(address from, address to, uint256 tokenId) public virtual override {
        safeTransferFrom(from, to, tokenId, "");
    }

    /**
     * Transfers a token to a receiver contract.
     * Defined in IERC721.
     * @param from Owner of the token
     * @param to Destination of the token (Must be a contract implementing IERC721Receiver)
     * @param tokenId The token ID
     * @param data Extra data to send to the receiver contract
     */
    function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory data) public virtual override {
        require(from != address(0), "ERC721: transfer from the zero address");
        require(to != address(0), "ERC721: transfer to the zero address");
        require(_isApprovedOrOwner(_msgSender(), tokenId), "ERC721: caller is not token owner or approved");
        
        _transfer(from, to, tokenId);

        require(_checkOnERC721Received(from, to, tokenId, data), "ERC721: transfer to non ERC721Receiver implementer");
    }

    /**
     * Burns a token.
     * @param from Owner of the token
     * @param tokenId The token ID
     */
    function burn(address from, uint256 tokenId) public {
        require(from != address(0), "ERC721: burn from the zero address");

        require(_isApprovedOrOwner(_msgSender(), tokenId), "ERC721: caller is not token owner or approved");

        _transfer(from, address(0), tokenId);
    }

    /* Root functions */

    /**
     * Creates a new token.
     * The ID of the new token is automatically generated by an incremental counter.
     * The ID of the new token can be obtained with the Transfer event.
     * Note: The token hash is permanent. Cannot be modified after minted.
     * Can only be called by the owner of the contract.
     * @param to The address that will receive the minted token
     * @param _hash The hash of the associated token information
     */
    function mint(address to, bytes32 _hash) public onlyRoot {
        uint256 tokenId = _generateTokenId();

        _hashes[tokenId] = _hash;

        _mint(to, tokenId);
    }

    /**
     * Updates contract metadata.
     * Can only be called by the owner of the contract.
     * @param name_ Token name
     * @param symbol_ Token symbol
     * @param base_uri_ Token base URI
     */
    function updateContractMetadata(string memory name_, string memory symbol_, string memory base_uri_) public onlyRoot {
        _name = name_;
        _symbol = symbol_;
        _base_uri = base_uri_;
    }
}



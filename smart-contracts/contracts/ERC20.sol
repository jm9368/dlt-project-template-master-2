// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "./IERC20.sol";
import "./IERC20Metadata.sol";
import "./Context.sol";
import "./Ownable.sol";

/**
 * Generic contract for fungible tokens.
 * Standard name: ERC20
 */
contract ERC20 is Ownable, Context, IERC20, IERC20Metadata {
    /* Contract data */

    // Mapping for balances
    mapping(address => uint256) private _balances;

    // Mapping for allowances
    mapping(address => mapping(address => uint256)) private _allowances;

    // Total amount of the token in circulation
    uint256 private _totalSupply;

    // Name of the token
    string private _name;

    // Symbol of the token
    string private _symbol;

    // Number of decimals for the token
    uint8 private _decimals;

    /* Internal functions*/

     /**
     * @dev Moves `amount` of tokens from `from` to `to`.
     *
     * This internal function is equivalent to {transfer}, and can be used to
     * e.g. implement automatic token fees, slashing mechanisms, etc.
     *
     * Emits a {Transfer} event.
     *
     * NOTE: This function is not virtual, {_update} should be overridden instead.
     */
    function _transfer(address from, address to, uint256 amount) internal {
        require(from != address(0), "ERC20: transfer from the zero address");
        require(to != address(0), "ERC20: transfer to the zero address");
        _update(from, to, amount);
    }

    /**
     * @dev Transfers `amount` of tokens from `from` to `to`, or alternatively mints (or burns) if `from` (or `to`) is
     * the zero address. All customizations to transfers, mints, and burns should be done by overriding this function.
     *
     * Emits a {Transfer} event.
     */
    function _update(address from, address to, uint256 amount) internal virtual {
        if (from == address(0)) {
            _totalSupply += amount;
        } else {
            uint256 fromBalance = _balances[from];
            require(fromBalance >= amount, "ERC20: transfer amount exceeds balance");
            unchecked {
                // Overflow not possible: amount <= fromBalance <= totalSupply.
                _balances[from] = fromBalance - amount;
            }
        }

        if (to == address(0)) {
            unchecked {
                // Overflow not possible: amount <= totalSupply or amount <= fromBalance <= totalSupply.
                _totalSupply -= amount;
            }
        } else {
            unchecked {
                // Overflow not possible: balance + amount is at most totalSupply, which we know fits into a uint256.
                _balances[to] += amount;
            }
        }

        emit Transfer(from, to, amount);
    }

    /**
     * @dev Creates `amount` tokens and assigns them to `account`, by transferring it from address(0).
     * Relies on the `_update` mechanism
     *
     * Emits a {Transfer} event with `from` set to the zero address.
     *
     * NOTE: This function is not virtual, {_update} should be overridden instead.
     */
    function _mint(address account, uint256 amount) internal {
        require(account != address(0), "ERC20: mint to the zero address");
        _update(address(0), account, amount);
    }

    /**
     * @dev Destroys `amount` tokens from `account`, by transferring it to address(0).
     * Relies on the `_update` mechanism.
     *
     * Emits a {Transfer} event with `to` set to the zero address.
     *
     * NOTE: This function is not virtual, {_update} should be overridden instead
     */
    function _burn(address account, uint256 amount) internal {
        require(account != address(0), "ERC20: burn from the zero address");
        _update(account, address(0), amount);
    }

    /**
     * @dev Sets `amount` as the allowance of `spender` over the `owner` s tokens.
     *
     * This internal function is equivalent to `approve`, and can be used to
     * e.g. set automatic allowances for certain subsystems, etc.
     *
     * Emits an {Approval} event.
     *
     * Requirements:
     *
     * - `owner` cannot be the zero address.
     * - `spender` cannot be the zero address.
     */
    function _approve(address owner, address spender, uint256 amount) internal virtual {
        require(owner != address(0), "ERC20: approve from the zero address");
        require(spender != address(0), "ERC20: approve to the zero address");

        _allowances[owner][spender] = amount;
        emit Approval(owner, spender, amount);
    }

    /**
     * @dev Updates `owner` s allowance for `spender` based on spent `amount`.
     *
     * Does not update the allowance amount in case of infinite allowance.
     * Revert if not enough allowance is available.
     *
     * Might emit an {Approval} event.
     */
    function _spendAllowance(address owner, address spender, uint256 amount) internal virtual {
        uint256 currentAllowance = allowance(owner, spender);
        if (currentAllowance != type(uint256).max) {
            require(currentAllowance >= amount, "ERC20: insufficient allowance");
            unchecked {
                _approve(owner, spender, currentAllowance - amount);
            }
        }
    }

    /* View functions */

    /**
     * Gets the name of the token.
     * Defined in IERC20Metadata.
     * @return string The Name of the token
     */
    function name() public view virtual override returns (string memory) {
        return _name;
    }

    /**
     * Gets the symbol of the token.
     * Defined in IERC20Metadata.
     * @return string The Symbol of the token
     */
    function symbol() public view virtual override returns (string memory) {
        return _symbol;
    }

    /**
     * Gets the number of decimals for user display.
     * Example: if decimals are 2, 505 is interpreted as 5.05.
     * Defined in IERC20Metadata.
     * @return uint8 The Number of decimals
     */
    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }

    /**
     * Gets the total supply in circulation.
     * Defined in IERC20.
     * @return uint256 The total supply
     */
    function totalSupply() public view virtual override returns (uint256) {
        return _totalSupply;
    }

    /**
     * Gets the balance of an account.
     * Defined in IERC20.
     * @param account The account
     * @return uint256 The balance of the account
     */
    function balanceOf(address account) public view virtual override returns (uint256) {
        return _balances[account];
    }

    /**
     * Checks the allowance for an authorized spender.
     * Defined in IERC20.
     * @param owner owner of the account
     * @param spender Authorized spender
     * @return uint256 The amount authorized to spend
     */
    function allowance(address owner, address spender) public view virtual override returns (uint256) {
        return _allowances[owner][spender];
    }

    /* Constructor */

    /**
     * Constructor
     * @param name_ Name of the token
     * @param symbol_ Symbol of the token
     * @param decimals_ Number of decimals
     */
    constructor(string memory name_, string memory symbol_, uint8 decimals_) {
        _init_ownable();
        _name = name_;
        _symbol = symbol_;
        _decimals = decimals_;
    }

    /* Transaction functions */

    /**
     * Transfer funds to another account.
     * Defined in IERC20.
     * @param to The destination account
     * @param amount Amount to transfer
     */
    function transfer(address to, uint256 amount) public virtual override returns (bool) {
        address owner = _msgSender();
        _transfer(owner, to, amount);
        return true;
    }

    /**
     * Approves an authorized spender to transfer an specific amount from your account.
     * Defined in IERC20.
     * @param spender The authorized spender
     * @param amount The authorized amount
     */
    function approve(address spender, uint256 amount) public virtual override returns (bool) {
        address owner = _msgSender();
        _approve(owner, spender, amount);
        return true;
    }

    /**
     * Increases the authorized amount an spender can use.
     * Defined in IERC20.
     * @param spender The authorized spender
     * @param addedValue The authorized amount to add
     */
    function increaseAllowance(address spender, uint256 addedValue) public virtual returns (bool) {
        address owner = _msgSender();
        _approve(owner, spender, allowance(owner, spender) + addedValue);
        return true;
    }

    /**
     * Decreases the authorized amount an spender can use.
     * Defined in IERC20.
     * @param spender The authorized spender
     * @param subtractedValue The authorized amount to subtract
     */
    function decreaseAllowance(address spender, uint256 subtractedValue) public virtual returns (bool) {
        address owner = _msgSender();
        uint256 currentAllowance = allowance(owner, spender);
        require(currentAllowance >= subtractedValue, "ERC20: decreased allowance below zero");
        unchecked {
            _approve(owner, spender, currentAllowance - subtractedValue);
        }

        return true;
    }

    /**
     * Transfer funds from an account to another.
     * You must be the owner of the account, or be authorized to spend the amount.
     * If you are authorized, the allowance will decrease by amount.
     * Defined in IERC20.
     * @param from Origin account
     * @param to Destination account
     * @param amount Amount to transfer
     */
    function transferFrom(address from, address to, uint256 amount) public virtual override returns (bool) {
        address spender = _msgSender();
        _spendAllowance(from, spender, amount);
        _transfer(from, to, amount);
        return true;
    }

    /**
     * Burns funds from your account.
     * @param amount Amount to burn
     */
    function burn(uint256 amount) public {
        _burn(_msgSender(), amount);
    }

    /* Root functions */

    /**
     * Mints tokens.
     * @param to Destination account
     * @param amount Amount to mint
     */
    function mint(address to, uint256 amount) public onlyRoot {
        _mint(to, amount);
    }

    /**
     * Updates contract metadata.
     * Can only be called by the owner of the contract.
     * @param name_ Token name
     * @param symbol_ Token symbol
     * @param decimals_ Number of decimals
     */
    function updateContractMetadata(string memory name_, string memory symbol_, uint8 decimals_) public onlyRoot {
        _name = name_;
        _symbol = symbol_;
        _decimals = decimals_;
    }
}

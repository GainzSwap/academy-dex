// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

import { ADexInfo } from "./AdexInfo.sol";

/**
 * @title ADEX
 * @dev ERC20 token representing the Academy-DEX base token. This token is mintable only upon deployment,
 * with the total supply set to the maximum defined in the `AdexInfo` library. The token is burnable
 * and is controlled by the owner of the contract.
 */
contract ADEX is ERC20, Ownable, ERC20Burnable {
	/**
	 * @dev Initializes the ERC20 token with the name "Academy-DEX-BaseToken" and symbol "ADEX".
	 * Mints the maximum supply of tokens to the contract owner.
	 */
	constructor() ERC20("Academy-DEX-BaseToken", "ADEX") {
		// Mint the maximum supply to the contract owner.
		_mint(owner(), ADexInfo.MAX_SUPPLY);
	}
}

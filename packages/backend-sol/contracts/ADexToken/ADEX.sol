// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import { ERC20Upgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import { OwnableUpgradeable } from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import { ERC20BurnableUpgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20BurnableUpgradeable.sol";

import { ADexInfo } from "./AdexInfo.sol";

/**
 * @title ADEX
 * @dev ERC20Upgradeable token representing the Academy-DEX base token. This token is mintable only upon deployment,
 * with the total supply set to the maximum defined in the `AdexInfo` library. The token is burnable
 * and is controlled by the owner of the contract.
 */
contract ADEX is
	ERC20Upgradeable,
	OwnableUpgradeable,
	ERC20BurnableUpgradeable
{
	/**
	 * @dev Initializes the ERC20Upgradeable token with the name "Academy-DEX-BaseToken" and symbol "ADEX".
	 * Mints the maximum supply of tokens to the contract owner.
	 */
	function initialize(address initialOwner) public initializer {
		__ERC20_init("Academy-DEX-BaseToken", "ADEX");
		__Ownable_init(initialOwner);
		// Mint the maximum supply to the contract owner.
		_mint(owner(), ADexInfo.MAX_SUPPLY);
	}

	function increaseSupply(address account, uint256 value) external onlyOwner {
		_mint(account, value);
	}

	function extraSupply() external view returns (uint256) {
		return totalSupply() - ADexInfo.MAX_SUPPLY;
	}
}

// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "./Pair.sol";
import { ADEX } from "../ADexToken/ADEX.sol";

/// @title DeployBasePair
/// @notice Library to deploy new instances of the `BasePair` contract.
library DeployBasePair {
	/// @notice Deploys a new instance of the `BasePair` contract.
	/// @dev Deploys a new `ADEX` token and passes its address to the `BasePair` contract.
	/// @return A new instance of the `BasePair` contract.
	function newBasePair() external returns (BasePair) {
		ADEX adex = new ADEX();
		return new BasePair(address(adex));
	}
}

/// @title MintableADEX
/// @notice A version of the `ADEX` token contract with minting capabilities.
contract MintableADEX is ADEX {
	/// @notice Mints new `ADEX` tokens by transferring from the owner's balance.
	/// @param to The address to receive the minted tokens.
	/// @param amt The amount of tokens to mint.
	function mint(address to, uint256 amt) external {
		_transfer(owner(), to, amt);
	}
}

/// @title DeployTestBasePair
/// @notice Library to deploy new instances of the `BasePair` contract for testing purposes.
/// @dev Uses the `MintableADEX` contract to enable token minting during tests.
library DeployTestBasePair {
	/// @notice Deploys a new instance of the `BasePair` contract with mintable `ADEX` tokens.
	/// @return A new instance of the `BasePair` contract.
	function newBasePair() external returns (BasePair) {
		ADEX adex = new MintableADEX();
		return new BasePair(address(adex));
	}
}

/**
 * @title BasePair
 * @dev This contract represents a base pair in the DEX, implementing mintable tokens and fee burning mechanisms.
 * @notice Inherits from the `Pair` contract and provides additional functionality for adding liquidity and setting up the base pair.
 */
contract BasePair is Pair {
	/// @notice Initializes the `BasePair` contract with the address of the `ADEX` token.
	/// @param adexAddress The address of the `ADEX` token contract.
	constructor(address adexAddress) Pair(adexAddress, address(this)) {}

	/// @notice Internal function to add liquidity to the base pair.
	/// @dev Overrides the `_addLiq` function from the `Pair` contract.
	/// @param wholePayment The payment details including the amount of tokens to add as liquidity.
	function _addLiq(TokenPayment calldata wholePayment) internal override {
		uint256 value = wholePayment.amount;
		_insertLiqValues(AddLiquidityContext({ deposit: value, liq: value }));
	}

	/// @notice Internal function to set the base pair address.
	/// @dev Overrides the `_setBasePair` function from the `Pair` contract but does nothing as this contract is the base pair.
	/// @param basePairAddr The address of the base pair, which is not used in this override.
	function _setBasePair(address basePairAddr) internal override {
		// This is the base pair, no action needed
	}
}

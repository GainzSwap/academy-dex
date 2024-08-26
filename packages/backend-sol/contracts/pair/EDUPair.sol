// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import { Pair, TokenPayment, AddLiquidityContext } from "./Pair.sol";
import { WEDU } from "../common/libs/WEDU.sol";

/// @title DeployEduPair
/// @notice Library to deploy new instances of `EDUPair`.
library DeployEduPair {
	/// @notice Deploys a new instance of the `EDUPair` contract.
	/// @param basePairAddr The address of the base pair contract.
	/// @return A new instance of the `EDUPair` contract.
	function newEDUPair(address basePairAddr) external returns (EDUPair) {
		return new EDUPair(basePairAddr);
	}
}

/// @title EDUPair
/// @notice A specialized pair contract for handling EduChain (EDU) token trades.
/// @dev Inherits from the `Pair` contract and customizes it to work specifically with `WEDU` tokens.
contract EDUPair is Pair {
	/// @notice Initializes the EDUPair contract with the base pair address.
	/// @param basePair The address of the base pair.
	constructor(address basePair) Pair(address(0), basePair) {}

	/// @notice Internal function to set the trade token as `WEDU`.
	/// @dev Overrides the `_setTradeToken` function from the `Pair` contract to use `WEDU`.
	/// @param tradeToken_ The address of the trade token.
	/// @dev A new instance of the `WEDU` contract is deployed and assigned as the trade token.
	function _setTradeToken(address tradeToken_) internal override {
		tradeToken = address(new WEDU());
	}

	/// @notice Fallback function to handle incoming EDU payments.
	receive() external payable {}
}

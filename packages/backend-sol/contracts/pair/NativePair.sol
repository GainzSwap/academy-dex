// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import { Pair, TokenPayment, AddLiquidityContext } from "./Pair.sol";

/**
 * @title BasePair
 * @dev This contract represents a base pair in the DEX, implementing mintable tokens and fee burning mechanisms.
 */
contract NativePair is Pair {
	constructor(address basePair) Pair(address(0), basePair) {}

	function _setTradeToken(address tradeToken_) internal override {
		// Trade token is taken as zero address
	}
}

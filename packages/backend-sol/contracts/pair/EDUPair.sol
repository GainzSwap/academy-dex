// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import { Pair, TokenPayment, AddLiquidityContext } from "./Pair.sol";
import { WEDU } from "../common/libs/WEDU.sol";

library DeployEduPair {
	function newEDUPair(address basePairAddr) external returns (EDUPair) {
		return new EDUPair(basePairAddr);
	}
}

contract EDUPair is Pair {
	constructor(address basePair) Pair(address(0), basePair) {}

	function _setTradeToken(address tradeToken_) internal override {
		tradeToken = address(new WEDU());
	}

	receive() external payable {}
}

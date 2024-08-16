// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "./TestingBasePair.sol";
import { ADEX, ADexInfo } from "../ADexToken/ADEX.sol";

contract MintableADEX is ADEX {}

library TestingPairFactory {
	function newPair(
		address tradeToken,
		address basePairAddr
	) external returns (Pair) {
		return new Pair(tradeToken, basePairAddr);
	}

	function newBasePair() external returns (BasePair) {
		ADEX adex = new ADEX();

		return new TestingBasePair(address(adex));
	}
}

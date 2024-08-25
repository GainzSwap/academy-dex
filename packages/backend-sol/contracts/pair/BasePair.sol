// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "./Pair.sol";
import { ADEX } from "../ADexToken/ADEX.sol";

library DeployBasePair {
	function newBasePair() external returns (BasePair) {
		ADEX adex = new ADEX();
		return new BasePair(address(adex));
	}
}

contract MintableADEX is ADEX {
	function mint(address to, uint256 amt) external {
		_transfer(owner(), to, amt);
	}
}

library DeployTestBasePair {
	function newBasePair() external returns (BasePair) {
		ADEX adex = new MintableADEX();

		return new BasePair(address(adex));
	}
}

/**
 * @title BasePair
 * @dev This contract represents a base pair in the DEX, implementing mintable tokens and fee burning mechanisms.
 */
contract BasePair is Pair, IBasePair {
	constructor(address adexAddress) Pair(adexAddress, address(this)) {}

	function _addLiq(TokenPayment calldata wholePayment) internal override {
		uint256 value = wholePayment.amount;
		_insertLiqValues(AddLiquidityContext({ deposit: value, liq: value }));
	}

	function _setBasePair(address basePairAddr) internal override {
		// This is base pair
	}
}

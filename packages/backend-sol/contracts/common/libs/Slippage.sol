// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity 0.8.26;

library Slippage {
	uint256 constant MAX_PERCENTAGE = 100_00;

	function _checkSlippage(uint256 slippage) private pure returns (uint256) {
		if (slippage < 1 || slippage > MAX_PERCENTAGE) {
			revert("Invalid slippage value");
		}

		return MAX_PERCENTAGE - slippage;
	}

	function compute(
		uint256 amount,
		uint256 slippage
	) internal pure returns (uint256) {
		return (amount * _checkSlippage(slippage)) / MAX_PERCENTAGE;
	}
}

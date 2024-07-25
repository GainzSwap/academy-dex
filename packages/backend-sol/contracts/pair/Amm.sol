//SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

library Amm {
	uint256 constant MAX_PERCENTAGE = 100_00;

	function calculateKConstant(
		uint256 firstTokenAmt,
		uint256 secondTokenAmt
	) internal pure returns (uint256) {
		return firstTokenAmt * secondTokenAmt;
	}

	function quote(
		uint256 firstTokenAmount,
		uint256 firstTokenReserve,
		uint256 secondTokenReserve
	) internal pure returns (uint256) {
		return (firstTokenAmount * secondTokenReserve) / firstTokenReserve;
	}

	function getAmountOut(
		uint256 amountIn,
		uint256 reserveIn,
		uint256 reserveOut,
		uint256 totalFeePercent
	) internal pure returns (uint256) {
		require(
			MAX_PERCENTAGE >= totalFeePercent,
			"AMM: Invalid computed fee percent"
		);
		uint256 amountInWithFee = amountIn * (MAX_PERCENTAGE - totalFeePercent);
		uint256 numerator = amountInWithFee * reserveOut;
		uint256 denominator = (reserveIn * MAX_PERCENTAGE) + amountInWithFee;

		return numerator / denominator;
	}
}

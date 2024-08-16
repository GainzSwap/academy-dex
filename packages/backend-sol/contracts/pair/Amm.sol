//SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

library Amm {
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
		uint256 reserveOut
	) internal pure returns (uint256) {
		return quote(amountIn, reserveIn + amountIn, reserveOut);
	}
}

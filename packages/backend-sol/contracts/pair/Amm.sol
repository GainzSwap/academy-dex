//SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

abstract contract AmmModule {
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
}

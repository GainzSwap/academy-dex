// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

struct RemoveLiquidityContext {
	uint256 lpTokenPaymentAmount;
	uint256 firstTokenAmountMin;
	uint256 secondTokenAmountMin;
	uint256 firstTokenAmountRemoved;
	uint256 secondTokenAmountRemoved;
}

library RemoveLiquidityContextUtil {
	function newContext(
		uint256 lpTokenPaymentAmount,
		uint256 firstTokenAmountMin,
		uint256 secondTokenAmountMin
	) internal pure returns (RemoveLiquidityContext memory) {
		return
			RemoveLiquidityContext(
				lpTokenPaymentAmount,
				firstTokenAmountMin,
				secondTokenAmountMin,
				0,
				0
			);
	}
}

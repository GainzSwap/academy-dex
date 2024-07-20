// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "../../common/libs/Types.sol";

struct AddLiquidityContext {
	ERC20TokenPayment firstPayment;
	ERC20TokenPayment secondPayment;
	uint256 firstTokenAmountMin;
	uint256 secondTokenAmountMin;
	uint256 firstTokenOptimalAmount;
	uint256 secondTokenOptimalAmount;
	uint256 liqAdded;
}

library AddLiquidityContextUtil {
	function newContext(
		ERC20TokenPayment memory firstPayment,
		ERC20TokenPayment memory secondPayment,
		uint256 firstTokenAmountMin,
		uint256 secondTokenAmountMin
	) internal pure returns (AddLiquidityContext memory context) {
		context.firstPayment = firstPayment;
		context.secondPayment = secondPayment;
		context.firstTokenAmountMin = firstTokenAmountMin;
		context.secondTokenAmountMin = secondTokenAmountMin;
		context.firstTokenOptimalAmount = 0;
		context.secondTokenOptimalAmount = 0;
		context.liqAdded = 0;
	}
}

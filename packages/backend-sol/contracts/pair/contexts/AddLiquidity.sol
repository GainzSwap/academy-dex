// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "../../common/libs/Types.sol";

struct AddLiquidityContext {
	ERC20TokenPayment payment;
	ERC20TokenPayment basePayment;
	uint256 liqAdded;
	uint256 depositAdded;
}

library AddLiquidityContextUtil {
	function newContext(
		ERC20TokenPayment memory payment,
		ERC20TokenPayment memory basePayment
	) internal pure returns (AddLiquidityContext memory context) {
		context.payment = payment;
		context.basePayment = basePayment;
		context.depositAdded = payment.amount;
		context.liqAdded = basePayment.amount;
	}
}

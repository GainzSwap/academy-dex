//SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "@uniswap/lib/contracts/libraries/TransferHelper.sol";
import "@openzeppelin/contracts/interfaces/IERC20.sol";

import "./Types.sol";

library TokenPayments {
	function receiveERC20(
		ERC20TokenPayment calldata firstPayment,
		ERC20TokenPayment calldata secondPayment
	) internal {
		address recipient = address(this);
		address sender = msg.sender;

		firstPayment.token.transferFrom(sender, recipient, firstPayment.amount);
		secondPayment.token.transferFrom(
			sender,
			recipient,
			secondPayment.amount
		);
	}

	function receiveERC20(ERC20TokenPayment calldata payment) internal {
		payment.token.transferFrom(msg.sender, address(this), payment.amount);
	}

	function receiveERC20(
		ERC20TokenPayment calldata payment,
		address from
	) internal {
		payment.token.transferFrom(from, address(this), payment.amount);
	}

	function sendMultipleTokensIfNotZero(
		address destination,
		ERC20TokenPayment[] memory payments
	) internal {
		for (uint index = 0; index < payments.length; index++) {
			ERC20TokenPayment memory payment = payments[index];
			if (payment.amount > 0) {
				TransferHelper.safeTransfer(
					address(payment.token),
					destination,
					payment.amount
				);
			}
		}
	}
}

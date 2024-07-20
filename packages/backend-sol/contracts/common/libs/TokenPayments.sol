//SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "@uniswap/lib/contracts/libraries/TransferHelper.sol";

import "./Types.sol";

library TokenPayments {
	function receive2(
		address receipient,
		address sender,
		ERC20TokenPayment memory firstPayment,
		ERC20TokenPayment memory secondPayment
	)
		internal
		returns (
			ERC20TokenPayment memory firstReceived,
			ERC20TokenPayment memory secondReceived
		)
	{
		TransferHelper.safeTransferFrom(
			firstPayment.tokenAddress,
			sender,
			receipient,
			firstPayment.amount
		);
		TransferHelper.safeTransferFrom(
			secondPayment.tokenAddress,
			sender,
			receipient,
			secondPayment.amount
		);

		(firstReceived, secondReceived) = (firstPayment, secondPayment);
	}

	function sendMultipleTokensIfNotZero(
		address destination,
		ERC20TokenPayment[] memory payments
	) internal {
		for (uint index = 0; index < payments.length; index++) {
			ERC20TokenPayment memory payment = payments[index];
			if (payment.amount > 0) {
				TransferHelper.safeTransfer(
					payment.tokenAddress,
					destination,
					payment.amount
				);
			}
		}
	}
}

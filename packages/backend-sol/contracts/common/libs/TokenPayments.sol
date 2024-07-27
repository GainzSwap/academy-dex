//SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "@uniswap/lib/contracts/libraries/TransferHelper.sol";
import "@openzeppelin/contracts/interfaces/IERC20.sol";

import "./Types.sol";

library TokenPayments {
	function receiveERC20(ERC20TokenPayment calldata payment) internal {
		payment.token.transferFrom(msg.sender, address(this), payment.amount);
	}

	function receiveERC20(
		ERC20TokenPayment calldata payment,
		address from
	) internal {
		payment.token.transferFrom(from, address(this), payment.amount);
	}
}

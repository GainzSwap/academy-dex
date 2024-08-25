// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "@openzeppelin/contracts/interfaces/IERC20.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import { SFT } from "../../modules/SFT.sol";
import { WEDU } from "./WEDU.sol";

import "hardhat/console.sol";

struct TokenPayment {
	address token;
	uint256 amount;
	uint256 nonce;
}

library TokenPayments {
	using Address for address;

	function receiveToken(TokenPayment memory payment) internal {
		receiveToken(payment, msg.sender);
	}

	function receiveToken(TokenPayment memory payment, address from) internal {
		if (msg.value > 0) {
			// Native payment (ETH)
			require(
				payment.amount == msg.value,
				"TokenPayments: ETH amount mismatch"
			);
			require(
				from == msg.sender,
				"TokenPayments: Native payment must be from caller"
			);

			// Wrap EDU into WEDU
			WEDU(payable(payment.token)).deposit{ value: msg.value }();
		} else if (payment.nonce == 0) {
			// ERC20 payment
			IERC20(payment.token).transferFrom(
				from,
				address(this),
				payment.amount
			);
		} else {
			// SFT payment
			SFT(payment.token).safeTransferFrom(
				from,
				address(this),
				payment.nonce,
				payment.amount,
				""
			);
		}
	}

	function sendToken(TokenPayment memory payment, address to) internal {
		if (payment.nonce == 0) {
			bool shouldMoveEthBalance = false;
			if (!to.isContract()) {
				uint256 beforeBal = address(this).balance;

				// Try to withdraw ETH assuming payment.token is WEDU
				(shouldMoveEthBalance, ) = payment.token.call(
					abi.encodeWithSignature("withdraw(uint256)", payment.amount)
				);

				// Checks to ensure balance movements
				if (shouldMoveEthBalance) {
					require(
						(beforeBal + payment.amount) == address(this).balance,
						"Failed to withdraw WEDU"
					);
				}
			}

			if (shouldMoveEthBalance) {
				payable(to).transfer(payment.amount);
			} else {
				IERC20(payment.token).transfer(to, payment.amount);
			}
		} else if (payment.nonce == 0) {
			// ERC20 payment
			IERC20(payment.token).transfer(to, payment.amount);
		} else {
			// SFT payment
			SFT(payment.token).safeTransferFrom(
				address(this),
				to,
				payment.nonce,
				payment.amount,
				""
			);
		}
	}

	function approve(TokenPayment memory payment, address to) internal {
		if (payment.nonce == 0) {
			// ERC20 approval
			IERC20(payment.token).approve(to, payment.amount);
		} else {
			// SFT approval
			SFT(payment.token).setApprovalForAll(to, true);
		}
	}
}

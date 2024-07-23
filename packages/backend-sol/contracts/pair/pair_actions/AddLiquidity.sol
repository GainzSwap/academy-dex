//SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "../../common/libs/TokenPayments.sol";

import "../contexts/AddLiquidity.sol";
import "../contexts/OutputBuilder.sol";

import "../Errors.sol";
import "../SafePrice.sol";
import "../LiquidityPool.sol";

import "./CommonMethods.sol";

library AddLiquidityUtil {
	using SafePriceUtil for SafePriceData;

	struct AddLiquidityEvent {
		address caller;
		address firstTokenId;
		uint256 firstTokenAmount;
		address secondTokenId;
		uint256 secondTokenAmount;
		address lpTokenId;
		uint256 lpTokenAmount;
		uint256 lpSupply;
		uint256 firstTokenReserves;
		uint256 secondTokenReserves;
		uint block;
		uint timestamp;
	}

	event AddLiquidity(
		address indexed firstToken,
		address indexed secondToken,
		address indexed caller,
		AddLiquidityEvent addLiquidityEvent
	);

	function _checkReceivedPayment(
		ERC20TokenPayment memory payment,
		IERC20 token
	) internal pure {
		if (payment.token != token || payment.amount <= 0) {
			revert ErrorBadPaymentTokens();
		}
	}

}

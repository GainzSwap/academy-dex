// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "../../common/libs/TokenPayments.sol";
import "../../common/libs/Types.sol";
import "../../pair/Fee.sol";

import "../contexts/Base.sol";
import "../contexts/OutputBuilder.sol";
import "../contexts/RemoveLiquidity.sol";

import "../LiquidityPool.sol";
import "../SafePrice.sol";
import "../Errors.sol";

import "../pair_actions/CommonResultTypes.sol";

import "./CommonMethods.sol";

library RemoveLiquidityUtil {
	using SafePriceUtil for SafePriceData;

	struct RemoveLiquidityEvent {
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

	event RemoveLiquidity(
		address indexed firstToken,
		address indexed secondToken,
		address indexed caller,
		RemoveLiquidityEvent removeLiquidityEvent
	);

	function removeLiquidity(
		storagecache storage storageCache,
		SafePriceData storage safePrice,
		uint256 firstTokenAmountMin,
		uint256 secondTokenAmountMin,
		ERC20TokenPayment calldata payment
	) internal returns (RemoveLiquidityResultType memory) {
		if (firstTokenAmountMin <= 0 || secondTokenAmountMin <= 0) {
			revert ErrorInvalidArgs();
		}

		if (!CommonMethodsUtil.isStateActive(storageCache.contractState)) {
			revert ErrorNotActive();
		}

		TokenPayments.receiveERC20(payment);
		if (payment.token != storageCache.lpToken || payment.amount <= 0) {
			revert ErrorBadPaymentTokens();
		}

		safePrice.updateSafePrice(
			storageCache.firstTokenReserve,
			storageCache.secondTokenReserve
		);

		uint256 initialK = Amm.calculateKConstant(
			storageCache.firstTokenReserve,
			storageCache.secondTokenReserve
		);

		RemoveLiquidityContext memory removeLiqContext = LiquidityPool
			.poolRemoveLiquidity(
				RemoveLiquidityContextUtil.newContext(
					payment.amount,
					firstTokenAmountMin,
					secondTokenAmountMin
				),
				storageCache
			);

		uint256 newK = Amm.calculateKConstant(
			storageCache.firstTokenReserve,
			storageCache.secondTokenReserve
		);
		if (newK > initialK) {
			revert ErrorKInvariantFailed();
		}

		FeeUtil.burn(
			storageCache.lpToken,
			removeLiqContext.lpTokenPaymentAmount
		);

		ERC20TokenPayment[] memory outputPayments = OutputBuilder
			.buildRemoveLiqOutputPayments(storageCache, removeLiqContext);

		ERC20TokenPayment memory firstPaymentAfter = outputPayments[0];
		ERC20TokenPayment memory secondPaymentAfter = outputPayments[1];
		if (firstPaymentAfter.amount < removeLiqContext.firstTokenAmountMin) {
			revert ErrorSlippageOnRemove();
		}
		if (secondPaymentAfter.amount < removeLiqContext.secondTokenAmountMin) {
			revert ErrorSlippageOnRemove();
		}

		TokenPayments.sendMultipleTokensIfNotZero(msg.sender, outputPayments);

		emitRemoveLiquidityEvent(storageCache, removeLiqContext);

		return OutputBuilder.buildRemoveLiqResults(outputPayments);
	}

	function emitRemoveLiquidityEvent(
		storagecache storage storageCache,
		RemoveLiquidityContext memory context
	) internal {
		address caller = msg.sender;
		emit RemoveLiquidity(
			address(storageCache.firstToken),
			address(storageCache.secondToken),
			caller,
			RemoveLiquidityEvent(
				caller,
				address(storageCache.firstToken),
				context.firstTokenAmountRemoved,
				address(storageCache.secondToken),
				context.secondTokenAmountRemoved,
				address(storageCache.lpToken),
				context.lpTokenPaymentAmount,
				storageCache.lpTokenSupply,
				storageCache.firstTokenReserve,
				storageCache.secondTokenReserve,
				block.number,
				block.timestamp
			)
		);
	}
}

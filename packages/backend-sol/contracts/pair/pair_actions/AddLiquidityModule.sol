//SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "../Errors.sol";
import "../ConfigModule.sol";
import "../SafePrice.sol";
import "../LiquidityPool.sol";

import "../contexts/Base.sol";
import "../contexts/AddLiquidity.sol";
import "../contexts/OutputBuilder.sol";

import "../../common/libs/Types.sol";
import "../../common/libs/TokenPayments.sol";
import "../../common/modules/PausableModule.sol";

import "./CommonMethods.sol";
import "./CommonResultTypes.sol";

abstract contract AddLiquidityModule is
	ConfigModule,
	PausableModule,
	CommonMethodsModule,
	SafePriceModule,
	SotrageCache,
	LiquidityPoolModule,
	OutputBuilderModule
{
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
		address token
	) internal pure {
		if (payment.tokenAddress != token || payment.amount <= 0) {
			revert ErrorBadPaymentTokens();
		}
	}

	function addLiquidity(
		uint256 firstTokenAmountMin,
		uint256 secondTokenAmountMin,
		ERC20TokenPayment memory firstPayment,
		ERC20TokenPayment memory secondPayment
	) external dropCache returns (AddLiquidityResultType memory output) {
		if (firstTokenAmountMin <= 0 || secondTokenAmountMin <= 0) {
			revert ErrorInvalidArgs();
		}

		if (!isStateActive(storageCache.contractState)) {
			revert ErrorNotActive();
		}

		address caller = msg.sender;

		// This looks like it is redundant, but the pattern is okay to prevent assumption of
		// receipt of payment when there is none
		(
			ERC20TokenPayment memory firstReceivedPayment,
			ERC20TokenPayment memory secondReceivedPayment
		) = TokenPayments.receive2(
				address(this),
				caller,
				firstPayment,
				secondPayment
			);
		_checkReceivedPayment(firstReceivedPayment, storageCache.firstTokenId);
		_checkReceivedPayment(
			secondReceivedPayment,
			storageCache.secondTokenId
		);

		if (
			!(initialLiquidityAdder == address(0) ||
				storageCache.lpTokenSupply != 0)
		) {
			revert ErrorInitialLiquidityNotAdded();
		}

		updateSafePrice(
			storageCache.firstTokenReserve,
			storageCache.secondTokenReserve
		);

		uint256 initialK = calculateKConstant(
			storageCache.firstTokenReserve,
			storageCache.secondTokenReserve
		);

		AddLiquidityContext memory addLiqContext = setOptimalAmounts(
			AddLiquidityContextUtil.newContext(
				firstPayment,
				secondPayment,
				firstTokenAmountMin,
				secondTokenAmountMin
			),
			storageCache
		);

		addLiqContext.liqAdded = storageCache.lpTokenSupply == 0
			? poolAddInitialLiquidity(
				addLiqContext.firstTokenOptimalAmount,
				addLiqContext.secondTokenOptimalAmount,
				storageCache
			)
			: poolAddLiquidity(
				addLiqContext.firstTokenOptimalAmount,
				addLiqContext.secondTokenOptimalAmount,
				storageCache
			);

		uint256 newK = calculateKConstant(
			storageCache.firstTokenReserve,
			storageCache.secondTokenReserve
		);
		if (initialK > newK) {
			revert ErrorKInvariantFailed();
		}

		// localMint -> Mint liquidity to contract
		_mint(address(this), addLiqContext.liqAdded);

		ERC20TokenPayment memory lpPayment = ERC20TokenPayment(
			storageCache.lpTokenId,
			addLiqContext.liqAdded
		);

		ERC20TokenPayment[] memory outputPayments = buildAddLiqOutputPayments(
			storageCache,
			addLiqContext
		);
		outputPayments[outputPayments.length - 1] = lpPayment;

		TokenPayments.sendMultipleTokensIfNotZero(caller, outputPayments);

		output = buildAddLiqResults(storageCache, addLiqContext);

		emitAddiquidityEvent(storageCache, addLiqContext);
	}

	function emitAddiquidityEvent(
		storagecache storage storageCache,
		AddLiquidityContext memory context
	) internal {
		address caller = msg.sender;

		emit AddLiquidity(
			storageCache.firstTokenId,
			storageCache.secondTokenId,
			caller,
			AddLiquidityEvent({
				caller: caller,
				firstTokenId: storageCache.firstTokenId,
				firstTokenAmount: context.firstTokenOptimalAmount,
				secondTokenId: storageCache.secondTokenId,
				secondTokenAmount: context.secondTokenOptimalAmount,
				lpTokenId: storageCache.lpTokenId,
				lpTokenAmount: context.liqAdded,
				lpSupply: storageCache.lpTokenSupply,
				firstTokenReserves: storageCache.firstTokenReserve,
				secondTokenReserves: storageCache.secondTokenReserve,
				block: block.number,
				timestamp: block.timestamp
			})
		);
	}
}

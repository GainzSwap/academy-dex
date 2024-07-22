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

	function addLiquidity(
		storagecache storage self,
		SafePriceData storage safePrice,
		uint256 firstTokenAmountMin,
		uint256 secondTokenAmountMin,
		ERC20TokenPayment calldata firstPayment,
		ERC20TokenPayment calldata secondPayment
	) internal returns (AddLiquidityResultType memory output) {
		if (firstTokenAmountMin <= 0 || secondTokenAmountMin <= 0) {
			revert ErrorInvalidArgs();
		}

		if (!CommonMethodsUtil.isStateActive(self.contractState)) {
			revert ErrorNotActive();
		}

		TokenPayments.receiveERC20(firstPayment, secondPayment);
		_checkReceivedPayment(firstPayment, self.firstToken);
		_checkReceivedPayment(secondPayment, self.secondToken);

		if (
			!(self.initialLiquidityAdder == address(0) ||
				self.lpTokenSupply != 0)
		) {
			revert ErrorInitialLiquidityNotAdded();
		}

		safePrice.updateSafePrice(
			self.firstTokenReserve,
			self.secondTokenReserve
		);

		uint256 initialK = Amm.calculateKConstant(
			self.firstTokenReserve,
			self.secondTokenReserve
		);

		AddLiquidityContext memory addLiqContext = LiquidityPool
			.setOptimalAmounts(
				AddLiquidityContextUtil.newContext(
					firstPayment,
					secondPayment,
					firstTokenAmountMin,
					secondTokenAmountMin
				),
				self
			);

		addLiqContext.liqAdded = self.lpTokenSupply == 0
			? LiquidityPool.poolAddInitialLiquidity(
				addLiqContext.firstTokenOptimalAmount,
				addLiqContext.secondTokenOptimalAmount,
				self
			)
			: LiquidityPool.poolAddLiquidity(
				addLiqContext.firstTokenOptimalAmount,
				addLiqContext.secondTokenOptimalAmount,
				self
			);

		uint256 newK = Amm.calculateKConstant(
			self.firstTokenReserve,
			self.secondTokenReserve
		);
		if (initialK > newK) {
			revert ErrorKInvariantFailed();
		}

		// localMint -> Mint liquidity to contract
		self.lpToken.localMint(addLiqContext.liqAdded);

		ERC20TokenPayment memory lpPayment = ERC20TokenPayment(
			self.lpToken,
			addLiqContext.liqAdded
		);

		ERC20TokenPayment[] memory outputPayments = OutputBuilder
			.buildAddLiqOutputPayments(self, addLiqContext);
		outputPayments[outputPayments.length - 1] = lpPayment;

		TokenPayments.sendMultipleTokensIfNotZero(msg.sender, outputPayments);

		output = OutputBuilder.buildAddLiqResults(self, addLiqContext);

		emitAddiquidityEvent(self, addLiqContext);
	}

	function emitAddiquidityEvent(
		storagecache storage storageCache,
		AddLiquidityContext memory context
	) internal {
		address caller = msg.sender;

		emit AddLiquidity(
			address(storageCache.firstToken),
			address(storageCache.secondToken),
			caller,
			AddLiquidityEvent({
				caller: caller,
				firstTokenId: address(storageCache.firstToken),
				firstTokenAmount: context.firstTokenOptimalAmount,
				secondTokenId: address(storageCache.secondToken),
				secondTokenAmount: context.secondTokenOptimalAmount,
				lpTokenId: address(storageCache.lpToken),
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

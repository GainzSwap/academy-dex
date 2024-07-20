// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

import "./contexts/Base.sol";
import "../common/libs/Cmp.sol";
import "./Errors.sol";
import "./contexts/AddLiquidity.sol";
import "./Amm.sol";

uint256 constant MINIMUM_LIQUIDITY = 1_000;

abstract contract LiquidityPoolModule is AmmModule, ERC20 {
	function poolAddLiquidity(
		uint256 firstTokenOptimalAmount,
		uint256 secondTokenOptimalAmount,
		storagecache storage storageCache
	) internal returns (uint256 liquidity) {
		uint256 firstPotentialAmt = (firstTokenOptimalAmount *
			storageCache.lpTokenSupply) / storageCache.firstTokenReserve;
		uint256 secondPotentialAmt = (secondTokenOptimalAmount *
			storageCache.lpTokenSupply) / storageCache.secondTokenReserve;

		liquidity = Cmp.min(firstPotentialAmt, secondPotentialAmt);
		if (liquidity <= 0) {
			revert ErrorInsufficientLiquidity();
		}
		storageCache.lpTokenSupply += liquidity;

		storageCache.firstTokenReserve += firstTokenOptimalAmount;
		storageCache.secondTokenReserve += secondTokenOptimalAmount;
	}

	function poolAddInitialLiquidity(
		uint256 firstTokenOptimalAmount,
		uint256 secondTokenOptimalAmount,
		storagecache storage storageCache
	) internal returns (uint256 liquidity) {
		liquidity = Cmp.min(firstTokenOptimalAmount, secondTokenOptimalAmount);
		if (liquidity <= MINIMUM_LIQUIDITY) {
			revert ErrorFirstLiquidity();
		}

		// localMint -> Mint liquidity to contract
		_mint(address(this), MINIMUM_LIQUIDITY);

		storageCache.lpTokenSupply = liquidity;
		storageCache.firstTokenReserve += firstTokenOptimalAmount;
		storageCache.secondTokenReserve += secondTokenOptimalAmount;

		liquidity -= MINIMUM_LIQUIDITY;
	}

	function setOptimalAmounts(
		AddLiquidityContext memory context,
		storagecache storage storageCache
	) internal view returns (AddLiquidityContext memory) {
		uint256 firstTokenAmountDesired = context.firstPayment.amount;
		uint256 secondTokenAmountDesired = context.secondPayment.amount;

		bool isInitialLiqAdd = storageCache.lpTokenSupply == 0;
		if (isInitialLiqAdd) {
			context.firstTokenOptimalAmount = firstTokenAmountDesired;
			context.secondTokenOptimalAmount = secondTokenAmountDesired;

			return context;
		}

		uint256 secondTokenAmountOptimal = quote(
			firstTokenAmountDesired,
			storageCache.firstTokenReserve,
			storageCache.secondTokenReserve
		);

		if (secondTokenAmountOptimal <= secondTokenAmountDesired) {
			context.firstTokenOptimalAmount = firstTokenAmountDesired;
			context.secondTokenOptimalAmount = secondTokenAmountOptimal;
		} else {
			uint256 firstTokenAmountOptimal = quote(
				secondTokenAmountDesired,
				storageCache.secondTokenReserve,
				storageCache.firstTokenReserve
			);
			if (firstTokenAmountOptimal > firstTokenAmountDesired) {
				revert ErrorOptimalGreaterThanPaid();
			}
			context.firstTokenOptimalAmount = firstTokenAmountOptimal;
			context.secondTokenOptimalAmount = secondTokenAmountDesired;
		}
		if (context.firstTokenOptimalAmount < context.firstTokenAmountMin) {
			revert ErrorInsufficientFirstToken();
		}
		if (context.secondTokenOptimalAmount < context.secondTokenAmountMin) {
			revert ErrorInsufficientSecondToken();
		}

		return context;
	}
}

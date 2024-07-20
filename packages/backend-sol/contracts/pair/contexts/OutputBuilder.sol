// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "./Base.sol";
import "./RemoveLiquidity.sol";
import "./AddLiquidity.sol";

import "../../common/libs/Types.sol";
import "../pair_actions/CommonResultTypes.sol";

abstract contract OutputBuilderModule {
	function buildAddLiqOutputPayments(
		storagecache storage storageCache,
		AddLiquidityContext memory addLiqContext
	) internal view returns (ERC20TokenPayment[] memory payments) {
		payments = new ERC20TokenPayment[](3);

		payments[0] = (
			ERC20TokenPayment(
				storageCache.firstTokenId,
				addLiqContext.firstPayment.amount -
					addLiqContext.firstTokenOptimalAmount
			)
		);
		payments[1] = (
			ERC20TokenPayment(
				storageCache.secondTokenId,
				addLiqContext.secondPayment.amount -
					addLiqContext.secondTokenOptimalAmount
			)
		);
	}

	function buildRemoveLiqOutputPayments(
		storagecache storage storageCache,
		RemoveLiquidityContext memory removeLiqContext
	) internal view returns (ERC20TokenPayment[3] memory payments) {
		payments[0] = (
			ERC20TokenPayment(
				storageCache.firstTokenId,
				removeLiqContext.firstTokenAmountRemoved
			)
		);
		payments[1] = (
			ERC20TokenPayment(
				storageCache.secondTokenId,
				removeLiqContext.secondTokenAmountRemoved
			)
		);
	}

	function buildAddLiqResults(
		storagecache storage storageCache,
		AddLiquidityContext memory addLiqContext
	) internal view returns (AddLiquidityResultType memory) {
		return
			AddLiquidityResultType(
				ERC20TokenPayment(
					storageCache.lpTokenId,
					addLiqContext.liqAdded
				),
				ERC20TokenPayment(
					storageCache.firstTokenId,
					addLiqContext.firstTokenOptimalAmount
				),
				ERC20TokenPayment(
					storageCache.secondTokenId,
					addLiqContext.secondTokenOptimalAmount
				)
			);
	}
}

// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "./Base.sol";
import "./RemoveLiquidity.sol";
import "./AddLiquidity.sol";

import "../../common/libs/Types.sol";
import "../pair_actions/CommonResultTypes.sol";

library OutputBuilder {
	function buildAddLiqOutputPayments(
		storagecache storage storageCache,
		AddLiquidityContext memory addLiqContext
	) internal view returns (ERC20TokenPayment[] memory payments) {
		payments = new ERC20TokenPayment[](3);

		// payments[0] = (
		// 	ERC20TokenPayment(
		// 		storageCache.firstToken,
		// 		addLiqContext.firstPayment.amount -
		// 			addLiqContext.firstTokenOptimalAmount
		// 	)
		// );
		// payments[1] = (
		// 	ERC20TokenPayment(
		// 		storageCache.secondToken,
		// 		addLiqContext.secondPayment.amount -
		// 			addLiqContext.secondTokenOptimalAmount
		// 	)
		// );
	}

	function buildRemoveLiqOutputPayments(
		storagecache storage storageCache,
		RemoveLiquidityContext memory removeLiqContext
	) internal view returns (ERC20TokenPayment[] memory payments) {
		payments = new ERC20TokenPayment[](3);

		payments[0] = (
			ERC20TokenPayment(
				storageCache.firstToken,
				removeLiqContext.firstTokenAmountRemoved
			)
		);
		payments[1] = (
			ERC20TokenPayment(
				storageCache.secondToken,
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
				ERC20TokenPayment(storageCache.lpToken, addLiqContext.liqAdded),
				ERC20TokenPayment(storageCache.firstToken, 0),
				ERC20TokenPayment(storageCache.secondToken, 0)
			);
	}

	function buildRemoveLiqResults(
		ERC20TokenPayment[] memory outputPayments
	) internal pure returns (RemoveLiquidityResultType memory) {
		return RemoveLiquidityResultType(outputPayments[0], outputPayments[1]);
	}
}

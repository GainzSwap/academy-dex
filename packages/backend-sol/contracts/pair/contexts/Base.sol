//SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "../../common/modules/PausableModule.sol";
import "../ConfigModule.sol";
import "../LpToken.sol";

struct storagecache {
	State contractState;
	LpToken lpToken;
	IERC20 firstToken;
	IERC20 secondToken;
	uint256 firstTokenReserve;
	uint256 secondTokenReserve;
	uint256 lpTokenSupply;
	address initialLiquidityAdder;
}

abstract contract StorageCache is ConfigModule {
	storagecache internal storageCache;

	modifier dropCache(State state) {
		storageCache = storagecache(
			state,
			lpToken,
			firstToken,
			secondToken,
			pairReserve[address(firstToken)],
			pairReserve[address(secondToken)],
			lpTokenSupply,
			initialLiquidityAdder
		);

		_;

		// commit changes to storage for the mutable fields
		pairReserve[address(firstToken)] = storageCache.firstTokenReserve;
		pairReserve[address(secondToken)] = storageCache.secondTokenReserve;
		lpTokenSupply = storageCache.lpTokenSupply;

		delete storageCache;
	}
}

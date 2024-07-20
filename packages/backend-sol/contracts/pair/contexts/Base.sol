//SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "../../common/modules/PausableModule.sol";
import "../ConfigModule.sol";

struct storagecache {
	State contractState;
	address lpTokenId;
	address firstTokenId;
	address secondTokenId;
	uint256 firstTokenReserve;
	uint256 secondTokenReserve;
	uint256 lpTokenSupply;
}

abstract contract SotrageCache is ConfigModule, PausableModule {
	storagecache internal storageCache;

	modifier dropCache() {
		storageCache.contractState = state;
		storageCache.lpTokenId = lpTokenIdentifier;
		storageCache.firstTokenId = firstToken;
		storageCache.secondTokenId = secondToken;
		storageCache.firstTokenReserve = pairReserve[firstToken];
		storageCache.secondTokenReserve = pairReserve[secondToken];
		storageCache.lpTokenSupply = lpTokenSupply;

		_;

		// commit changes to storage for the mutable fields
		pairReserve[firstToken] = storageCache.firstTokenReserve;
		pairReserve[secondToken] = storageCache.secondTokenReserve;
		lpTokenSupply = storageCache.lpTokenSupply;

		delete storageCache;
	}
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import '../pair/BasePair.sol';

/// @title DeployTestBasePair
/// @notice Library to deploy new instances of the `BasePair` contract for testing purposes.
/// @dev Uses the `MintableADEX` contract to enable token minting during tests.
library DeployTestBasePair {
	/// @notice Deploys a new instance of the `BasePair` contract with mintable `ADEX` tokens.
	/// @return A new instance of the `BasePair` contract.
	function newBasePair() external returns (BasePair) {
		ADEX adex = new MintableADEX();
		return new BasePair(address(adex));
	}
}
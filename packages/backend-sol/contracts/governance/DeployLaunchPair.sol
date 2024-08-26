// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import { LaunchPair } from "./LaunchPair.sol";

library DeployLaunchPair {
	function newLaunchPair(address _lpToken) external returns (LaunchPair) {
		return new LaunchPair(_lpToken);
	}
}

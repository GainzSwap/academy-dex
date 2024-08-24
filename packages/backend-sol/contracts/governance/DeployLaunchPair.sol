// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import { LaunchPair } from "./LaunchPair.sol";

library DeployLaunchPair {
	function newLaunchPair() external returns (LaunchPair) {
		return new LaunchPair();
	}
}

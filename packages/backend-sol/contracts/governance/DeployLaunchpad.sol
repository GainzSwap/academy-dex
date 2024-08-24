// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import { Launchpad } from "./Launchpad.sol";

library DeployLaunchpad {
	function newLaunchpad() external returns (Launchpad) {
		return new Launchpad();
	}
}

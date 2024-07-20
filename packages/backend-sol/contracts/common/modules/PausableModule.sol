//SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "./PermissionsModule.sol";

enum State {
	Inactive,
	Active,
	PartialActive
}

abstract contract PausableModule is PermissionsModule {
	State public state;

	function resume() external {
		requireCallerHasPausePermissions();
		state = State.Active;
	}
}

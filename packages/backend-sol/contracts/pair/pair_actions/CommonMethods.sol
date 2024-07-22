//SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "../../common/modules/PausableModule.sol";

library CommonMethodsUtil {
	function isStateActive(State state) internal pure returns (bool isActive) {
		isActive = state == State.Active || state == State.PartialActive;
	}

	function canSwap(State state) internal pure returns (bool isSwapable) {
		isSwapable = state == State.Active;
	}
}

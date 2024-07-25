// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "../router/Router.sol";
import "./TestingBasePair.sol";

contract TestingRouter is Router {
	function _newBasePair() internal override returns (BasePair) {
		return new TestingBasePair();
	}
}

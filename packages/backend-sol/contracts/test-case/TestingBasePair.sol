// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "../pair/BasePair.sol";

contract TestingBasePair is BasePair {
	constructor(address adexAddr) BasePair(adexAddr) {}
}

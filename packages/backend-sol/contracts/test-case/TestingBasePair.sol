// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "../pair/BasePair.sol";

contract TestingBasePair is BasePair {
	constructor(address adexAddr) BasePair(adexAddr) {}
}

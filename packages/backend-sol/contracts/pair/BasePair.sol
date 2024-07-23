//SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "./Pair.sol";

contract BasePair is Pair {
	constructor(address tradeToken_) Pair(tradeToken_, address(this)) {}
}

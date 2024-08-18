// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "@openzeppelin/contracts/access/Ownable.sol";

abstract contract KnowablePair is Ownable {
	modifier isKnownPair() {
		require(owner() == Ownable(msg.sender).owner(), "not allowed");
		require(msg.sender != address(this), "self cannnot be known pair");
		_;
	}
}

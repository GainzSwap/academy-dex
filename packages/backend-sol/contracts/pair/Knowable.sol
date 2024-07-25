// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity 0.8.26;

import "@openzeppelin/contracts/access/Ownable.sol";

abstract contract KnowablePair is Ownable {
	// mapping(address => bool) knownPairs;
	// function addPair(address pairAddress) external onlyOwner {
	// 	knownPairs[pairAddress] = true;
	// }

	modifier isKnownPair(address caller) {
		require(owner() == Ownable(caller).owner(), "not allowed");
		_;
	}
}

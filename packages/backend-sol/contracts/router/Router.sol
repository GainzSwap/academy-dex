// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity 0.8.26;

import "@openzeppelin/contracts/access/Ownable.sol";

import "../pair/Pair.sol";
import "../pair/BasePair.sol";

contract Router is Ownable {
	address basePairAddr;

	// For now, called by only owner..when DAO is implemented, DAO can call this
	// The first pair becomes the base pair
	function createPair(
		address tradeToken
	) external onlyOwner returns (Pair pair) {
		if (basePairAddr == address(0)) {
			pair = new BasePair();
			basePairAddr = address(pair);
		} else {
			pair = new Pair(tradeToken, basePairAddr);
		}
	}
}

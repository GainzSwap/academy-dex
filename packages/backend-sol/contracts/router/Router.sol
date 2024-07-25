// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity 0.8.26;

import "@openzeppelin/contracts/access/Ownable.sol";

import "../pair/Pair.sol";
import "../pair/BasePair.sol";

contract Router is Ownable {
	address public basePairAddr;

	mapping(address => address) public tokensPairAddress;

	// For now, called by only owner..when DAO is implemented, DAO can call this
	// The first pair becomes the base pair
	function createPair(
		address tradeToken
	) external onlyOwner returns (Pair pair) {
		require(
			tokensPairAddress[tradeToken] == address(0),
			"Token already added"
		);

		if (basePairAddr == address(0)) {
			pair = _newBasePair();
			basePairAddr = address(pair);
			tradeToken = address(pair.tradeToken());
		} else {
			pair = new Pair(tradeToken, basePairAddr);
		}

		tokensPairAddress[tradeToken] = address(pair);
	}

	function addLiquidity(ERC20TokenPayment calldata wholePayment) external {
		address tokenAddress = address(wholePayment.token);
		Pair pair = Pair(tokensPairAddress[tokenAddress]);

		pair.addLiquidity(wholePayment, msg.sender);
	}

	function _newBasePair() internal virtual returns (BasePair) {
		return new BasePair();
	}
}

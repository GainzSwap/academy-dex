//SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "./Pair.sol";
import "../common/libs/MintableERC20.sol";

contract BasePair is Pair, IBasePair {
	constructor()
		Pair(
			address(new MintableERC20("AcademyDEX-BaseToken", "BASE")),
			address(this)
		)
	{}

	function burnFee(uint256 amount) external isKnownPair(msg.sender) {
		_takeFromReserve(amount);
		MintableERC20(address(tradeToken)).burn(amount);
	}

	function mintRewards(uint256 amount) external isKnownPair(msg.sender) {
		address pairAddress = msg.sender;
		Pair pair = Pair(pairAddress);

		// TODO use decay method to bound mintiing
		uint256 mintAmount = Amm.quote(amount, pair.reserve(), reserve());

		MintableERC20 token = MintableERC20(address(tradeToken));
		token.mint(address(this), mintAmount);
		// TODO send some mintAmount to others in ecosystem
		token.approve(pairAddress, mintAmount);

		pair.receiveReward(
			ERC20TokenPayment({ amount: mintAmount, token: token })
		);
	}
}

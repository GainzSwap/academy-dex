//SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "./Pair.sol";
import "../common/libs/MintableERC20.sol";

contract BasePair is Pair {
	constructor()
		Pair(
			address(new MintableERC20("AcademyDEX-BaseToken", "BASE")),
			address(this)
		)
	{}

	function mintRewards(uint256 amount) external isKnownPair(msg.sender) {
		address pairAddress = msg.sender;
		Pair pair = Pair(pairAddress);

		uint256 mintAmount = Amm.quote(amount, pair.reserve(), reserve());

		MintableERC20 token = MintableERC20(address(tradeToken));
		token.mint(address(this), mintAmount);
		// TODO send some mintAmount to others in ecosystem
		// TODO use decay method and bound mintiing
		token.approve(pairAddress, mintAmount);

		pair.takeReward(
			ERC20TokenPayment({ amount: mintAmount, token: token })
		);
	}
}

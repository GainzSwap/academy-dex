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

	function mintRewards(Pair pair, uint256 amount) external {
		uint256 mintAmount = Amm.quote(amount, pair.reserve(), reserve());

		MintableERC20 token = MintableERC20(address(tradeToken));
		token.mint(address(pair), mintAmount);
		token.approve(address(pair), mintAmount);

		pair.takeReward(mintAmount);
	}
}

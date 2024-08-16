// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "./Pair.sol";
import { ADEX } from "../ADexToken/ADEX.sol";

/**
 * @title BasePair
 * @dev This contract represents a base pair in the DEX, implementing mintable tokens and fee burning mechanisms.
 */
contract BasePair is Pair, IBasePair {
	constructor(address adexAddress) Pair(adexAddress, address(this)) {}

	/**
	 * @notice Mints rewards to the calling pair address.
	 * @param amount Amount of rewards to mint.
	 */
	function mintRewards(uint256 amount) external isKnownPair {
		address pairAddress = msg.sender;
		Pair pair = Pair(pairAddress);

		uint256 mintAmount = Amm.quote(amount, pair.reserve(), reserve());

		ADEX token = ADEX(address(tradeToken));
		// token.mint(address(this), mintAmount);
		// TODO send some mintAmount to others in ecosystem
		token.approve(pairAddress, mintAmount);

		pair.receiveReward(
			ERC20TokenPayment({ amount: mintAmount, token: token })
		);
	}
}

// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "./Pair.sol";
import "../common/libs/MintableERC20.sol";

/**
 * @title BasePair
 * @dev This contract represents a base pair in the DEX, implementing mintable tokens and fee burning mechanisms.
 */
contract BasePair is Pair, IBasePair {
	constructor()
		Pair(
			address(new MintableERC20("AcademyDEX-BaseToken", "BASE")),
			address(this)
		)
	{}

	/**
	 * @notice Burns a specified amount of fees.
	 * @param amount Amount of fees to burn.
	 */
	function burnFee(uint256 amount) external isKnownPair(msg.sender) {
		MintableERC20(address(tradeToken)).burn(amount);

		// Transfer amount to rewards so that the effect
		// will be felt on price
		_takeFromReserve(amount);
		rewards += amount;
	}

	/**
	 * @notice Mints rewards to the calling pair address.
	 * @param amount Amount of rewards to mint.
	 */
	function mintRewards(uint256 amount) external isKnownPair(msg.sender) {
		address pairAddress = msg.sender;
		Pair pair = Pair(pairAddress);

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

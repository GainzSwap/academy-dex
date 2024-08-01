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
	 * @notice Mints the initial supply of the base trade token to the specified recipient.
	 * @dev This function can only be called by the owner of the contract.
	 *      The minting only occurs if the total supply of the trade token is zero.
	 * @param amount The amount of tokens to mint as the initial supply.
	 * @param recipient The address to receive the minted tokens.
	 */
	function mintInitialSupply(
		uint256 amount,
		address recipient
	) external onlyOwner {
		// Check if the total supply of the trade token is zero
		if (tradeToken.totalSupply() == 0) {
			// Mint the specified amount of the trade token to the recipient
			MintableERC20(address(tradeToken)).mint(recipient, amount);
		}
	}

	/**
	 * @notice Mints rewards to the calling pair address.
	 * @param amount Amount of rewards to mint.
	 */
	function mintRewards(uint256 amount) external isKnownPair {
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

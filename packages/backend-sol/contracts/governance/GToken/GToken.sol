// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { GToken } from "./GTokenAttributes.sol";
import { SFT } from "../../modules/SFT.sol";
import { TokenPayment } from "../../common/libs/TokenPayments.sol";

/// @title GTokens Contract
/// @notice This contract handles the minting of governance tokens (GTokens) used in the ADEX platform.
/// @dev The contract extends a semi-fungible token (SFT) and uses GToken attributes for staking.
contract GTokens is SFT {
	using GToken for GToken.Attributes;

	struct GovernanceBalance {
		uint256 nonce;
		uint256 amount;
		GToken.Attributes attributes;
	}

	/// @notice Constructor to initialize the GTokens contract.
	/// @dev Sets the name and symbol of the SFT for GTokens.
	constructor() SFT("ADEX Governance Token", "GTADEX") {}

	/// @notice Mints a new GToken for the given address.
	/// @dev The function encodes GToken attributes and mints the token with those attributes.
	/// @param to The address that will receive the minted GToken.
	/// @param rewardPerShare The reward per share at the time of minting.
	/// @param epochsLocked The number of epochs for which the LP tokens are locked.
	/// @param lpAmount The amount of LP tokens staked.
	/// @param currentEpoch The current epoch when the GToken is minted.
	/// @param lpPayments An array of TokenPayment structs representing the LP token payments.
	/// @return uint256 The token ID of the newly minted GToken.
	function mintGToken(
		address to,
		uint256 rewardPerShare,
		uint256 epochsLocked,
		uint256 lpAmount,
		uint256 currentEpoch,
		TokenPayment[] memory lpPayments
	) external onlyOwner returns (uint256) {
		// Create GToken attributes and compute the stake weight
		bytes memory attributes = abi.encode(
			GToken
				.Attributes({
					lpPayments: lpPayments,
					rewardPerShare: rewardPerShare,
					epochStaked: currentEpoch,
					lastClaimEpoch: currentEpoch,
					epochsLocked: epochsLocked,
					lpAmount: lpAmount,
					stakeWeight: 0
				})
				.computeStakeWeight() // Compute stake weight based on LP amount and epochs locked
		);

		// Mint the GToken with the specified attributes and return the token ID
		return _mint(to, 1, attributes);
	}

	/**
	 * @notice Retrieves the governance token balance and attributes for a specific user at a given nonce.
	 * @dev This function checks if the user has a Semi-Fungible Token (SFT) at the provided nonce.
	 * If the user does not have a balance at the specified nonce, the function will revert with an error.
	 * The function then returns the governance balance for the user at that nonce.
	 *
	 * @param user The address of the user whose balance is being queried.
	 * @param nonce The nonce for the specific GToken to retrieve.
	 *
	 * @return GovernanceBalance A struct containing the nonce, amount, and attributes of the GToken.
	 *
	 * Requirements:
	 * - The user must have a GToken balance at the specified nonce.
	 */
	function getBalanceAt(
		address user,
		uint256 nonce
	) public view returns (GovernanceBalance memory) {
		require(
			hasSFT(user, nonce),
			"No GToken balance found at nonce for user"
		);

		return
			GovernanceBalance({
				nonce: nonce,
				amount: balanceOf(user, nonce),
				attributes: abi.decode(
					_getRawTokenAttributes(nonce),
					(GToken.Attributes)
				)
			});
	}

	/**
	 * @notice Retrieves the entire GToken balance and attributes for a specific user.
	 * @dev This function queries all Semi-Fungible Tokens (SFTs) held by the user and decodes
	 * the attributes for each GToken.
	 *
	 * @param user The address of the user whose balances are being queried.
	 *
	 * @return GovernanceBalance[] An array of structs, each containing the nonce, amount, and attributes
	 * of the user's GTokens.
	 */
	function getGTokenBalance(
		address user
	) public view returns (GovernanceBalance[] memory) {
		SftBalance[] memory _sftBals = _sftBalance(user);
		GovernanceBalance[] memory balance = new GovernanceBalance[](
			_sftBals.length
		);

		for (uint256 i = 0; i < _sftBals.length; i++) {
			SftBalance memory _sftBal = _sftBals[i];

			balance[i] = GovernanceBalance({
				nonce: _sftBal.nonce,
				amount: _sftBal.amount,
				attributes: abi.decode(_sftBal.attributes, (GToken.Attributes))
			});
		}

		return balance;
	}
}

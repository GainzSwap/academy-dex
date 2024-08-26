// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import { GToken } from "./GTokenAttributes.sol";
import { SFT } from "../../modules/SFT.sol";
import { TokenPayment } from "../../common/libs/TokenPayments.sol";

struct GTokensBalance {
	uint256 nonce;
	uint256 amount;
	GToken.Attributes attributes;
}

uint256 constant GTOKEN_MINT_AMOUNT = 1;

/// @title GTokens Contract
/// @notice This contract handles the minting of governance tokens (GTokens) used in the ADEX platform.
/// @dev The contract extends a semi-fungible token (SFT) and uses GToken attributes for staking.
contract GTokens is SFT {
	using GToken for GToken.Attributes;

	uint256 private _totalStakeWeight;
	uint256 private _totalLpAmount;

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
		return _mint(to, GTOKEN_MINT_AMOUNT, attributes);
	}

	function update(
		address user,
		uint256 nonce,
		uint256 amount,
		GToken.Attributes memory attr
	) external onlyOwner returns (uint256) {
		require(amount <= GTOKEN_MINT_AMOUNT, "GToken: Invalid update amount");
		return super.update(user, nonce, amount, abi.encode(attr));
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
	 * @return GTokensBalance A struct containing the nonce, amount, and attributes of the GToken.
	 *
	 * Requirements:
	 * - The user must have a GToken balance at the specified nonce.
	 */
	function getBalanceAt(
		address user,
		uint256 nonce
	) public view returns (GTokensBalance memory) {
		require(
			hasSFT(user, nonce),
			"No GToken balance found at nonce for user"
		);

		return
			GTokensBalance({
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
	 * @return GTokensBalance[] An array of structs, each containing the nonce, amount, and attributes
	 * of the user's GTokens.
	 */
	function getGTokenBalance(
		address user
	) public view returns (GTokensBalance[] memory) {
		SftBalance[] memory _sftBals = _sftBalance(user);
		GTokensBalance[] memory balance = new GTokensBalance[](_sftBals.length);

		for (uint256 i = 0; i < _sftBals.length; i++) {
			SftBalance memory _sftBal = _sftBals[i];

			balance[i] = GTokensBalance({
				nonce: _sftBal.nonce,
				amount: _sftBal.amount,
				attributes: abi.decode(_sftBal.attributes, (GToken.Attributes))
			});
		}

		return balance;
	}

	function totalStakeWeight() public view returns (uint256) {
		return _totalStakeWeight;
	}

	function totalLpAmount() public view returns (uint256) {
		return _totalLpAmount;
	}

	function _beforeTokenTransfer(
		address operator,
		address from,
		address to,
		uint256[] memory ids,
		uint256[] memory amounts,
		bytes memory data
	) internal override {
		super._beforeTokenTransfer(operator, from, to, ids, amounts, data);

		for (uint256 i; i < ids.length; i++) {
			uint256 id = ids[i];
			GToken.Attributes memory attr = abi.decode(
				_getRawTokenAttributes(id),
				(GToken.Attributes)
			);

			if (from == address(0) && to != address(0)) {
				// We are minting, so increease staking weight
				_totalStakeWeight += attr.stakeWeight;
				_totalLpAmount += attr.lpAmount;
			} else if (from != address(0) && to == address(0)) {
				// We are burning, so decrease staking weight
				_totalStakeWeight -= attr.stakeWeight;
				_totalLpAmount -= attr.lpAmount;
			}
		}
	}
}

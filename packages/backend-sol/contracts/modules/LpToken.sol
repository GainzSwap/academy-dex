// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import { SFT } from "./SFT.sol";

contract LpToken is SFT {
	struct LpAttributes {
		uint256 rewardPerShare;
		uint256 depValuePerShare;
		address pair;
		address tradeToken;
	}

	struct LpBalance {
		uint256 nonce;
		uint256 amount;
		LpAttributes attributes;
	}

	constructor() SFT("Academy-DEX LP Token", "LPADEX") {}

	/// @notice Returns the SFT balance of a user including detailed attributes.
	/// @param user The address of the user to check.
	/// @return An array of `LpBalance` containing the user's balance details.
	function lpBalanceOf(
		address user
	) public view returns (LpBalance[] memory) {
		SftBalance[] memory _sftBals = _sftBalance(user);
		LpBalance[] memory balance = new LpBalance[](_sftBals.length);

		for (uint256 i; i < _sftBals.length; i++) {
			SftBalance memory _sftBal = _sftBals[i];

			balance[i] = LpBalance({
				nonce: _sftBal.nonce,
				amount: _sftBal.amount,
				attributes: abi.decode(_sftBal.attributes, (LpAttributes))
			});
		}

		return balance;
	}

	function mint(
		uint256 rewardPerShare,
		uint256 lpAmount,
		address pair,
		address tradeToken,
		address to,
		uint256 depValuePerShare
	) external onlyOwner {
		require(lpAmount > 0, "LpToken: LP Amount must be greater than 0");

		bytes memory attributes = abi.encode(
			LpAttributes({
				rewardPerShare: rewardPerShare,
				pair: pair,
				tradeToken: tradeToken,
				depValuePerShare: depValuePerShare
			})
		);

		_mint(to, lpAmount, attributes);
	}

	function getBalanceAt(
		address user,
		uint256 nonce
	) public view returns (LpBalance memory) {
		require(hasSFT(user, nonce), "No Lp balance found at nonce for user");

		return
			LpBalance({
				nonce: nonce,
				amount: balanceOf(user, nonce),
				attributes: abi.decode(
					_getRawTokenAttributes(nonce),
					(LpAttributes)
				)
			});
	}
}

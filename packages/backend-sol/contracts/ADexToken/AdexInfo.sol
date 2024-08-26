// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

/**
 * @title ADexInfo
 * @dev A library providing constants related to the Academy-DEX token (ADEX), including its
 * decimal precision, maximum supply, and various fund allocations.
 */
library ADexInfo {
	/// @dev The number of decimal places the ADEX token uses (18 decimals).
	uint256 public constant DECIMALS = 18;

	/// @dev Represents 1 unit of ADEX in its smallest denomination, taking into account the DECIMALS constant.
	uint256 public constant ONE = 10 ** DECIMALS;

	/// @dev The maximum supply of the ADEX token, which is 21 million tokens.
	uint256 public constant MAX_SUPPLY = 21_000_000 * ONE;

	/**
	 * @dev The amount of ADEX tokens allocated for ecosystem distribution.
	 * This amount is set to 13.65 million tokens plus an additional fractional amount.
	 */
	uint256 public constant ECOSYSTEM_DISTRIBUTION_FUNDS =
		(13_650_000 * ONE) + 2_248_573_618_499_339;

	/// @dev The initial liquidity provision for the ADEX token, set to 1 million tokens.
	uint256 public constant INTIAL_LIQUIDITY = 1_000_000 * ONE;

	/**
	 * @dev The amount of ADEX tokens allocated for the Initial Coin Offering (ICO).
	 * This is calculated as the remaining tokens after subtracting ecosystem distribution
	 * funds and initial liquidity from the maximum supply.
	 */
	uint256 public constant ICO_FUNDS =
		MAX_SUPPLY - ECOSYSTEM_DISTRIBUTION_FUNDS - INTIAL_LIQUIDITY;
}

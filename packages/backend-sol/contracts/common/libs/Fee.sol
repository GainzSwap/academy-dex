// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "./Math.sol";
import "./Number.sol";

library FeeUtil {
	using Number for uint256;

	/// @dev The maximum percentage value, represented with 2 decimal places (100.00%).
	uint256 constant MAX_PERCENT = 100_00;

	/// @dev Struct to hold the different fee values: burn, referrer, and liquidity providers.
	struct Values {
		uint256 toBurnValue; // The portion of the fee that will be burned.
		uint256 referrerValue; // The portion of the fee allocated to the referrer.
		uint256 liqProvidersValue; // The portion of the fee allocated to liquidity providers.
	}

	/// @dev Balance factor used for calculating ratios, with up to three decimal places of precision.
	uint64 constant RATIO_BALANCE_FACTOR = 1_000;

	/// @dev Minimum fee percentage (0.10%).
	uint64 constant MIN_FEE = 10;

	/// @dev First fee threshold percentage (0.30%).
	uint64 constant FIRST_FEE = 30;

	/// @dev Second fee threshold percentage (9.00%).
	uint64 constant SECOND_FEE = 9_00;

	/// @dev Maximum fee percentage (100.00%).
	uint64 constant THIRD_FEE = uint64(MAX_PERCENT);

	/**
	 * @notice Calculates the fee percentage based on the total sales of a pair, total liquidity, and the number of pairs.
	 * @param pairTotalSales The total sales amount for the pair.
	 * @param totalLiq The total liquidity across all pairs.
	 * @param pairsCount The number of pairs.
	 * @return percent The calculated fee percentage.
	 */
	function feePercent(
		uint256 pairTotalSales,
		uint256 totalLiq,
		uint64 pairsCount
	) internal pure returns (uint256 percent) {
		uint64 ratio = _pairRatio(pairTotalSales, totalLiq, pairsCount);

		(
			uint64 minIn,
			uint64 maxIn,
			uint64 minOut,
			uint64 maxOut
		) = _getInterValues(ratio, pairsCount);

		percent = MathUtil.linearInterpolation(
			minIn,
			maxIn,
			ratio,
			minOut,
			maxOut
		);
	}

	/**
	 * @notice Determines the interpolation values based on the ratio and the number of pairs.
	 * @param ratio The calculated pair ratio.
	 * @param pairsCount The number of pairs.
	 * @return minIn The minimum input for interpolation.
	 * @return maxIn The maximum input for interpolation.
	 * @return minOut The minimum output for interpolation.
	 * @return maxOut The maximum output for interpolation.
	 */
	function _getInterValues(
		uint256 ratio,
		uint64 pairsCount
	)
		private
		pure
		returns (uint64 minIn, uint64 maxIn, uint64 minOut, uint64 maxOut)
	{
		minIn = 1;
		maxIn = RATIO_BALANCE_FACTOR;
		minOut = MIN_FEE;
		maxOut = FIRST_FEE;

		uint64 MAX_RATIO_BALANCE_FACTOR = _maxRatioBalanceFactor(pairsCount);

		uint64 count = 0;
		while (ratio > maxIn) {
			minIn = maxIn + 1;
			minOut = maxOut + 1;

			if (count == 0) {
				maxIn = MAX_RATIO_BALANCE_FACTOR / 2;
				maxOut = SECOND_FEE;
			} else if (count == 1) {
				maxIn = MAX_RATIO_BALANCE_FACTOR;
				maxOut = THIRD_FEE;
			} else {
				revert(
					"FeeUtil._getInterValues: max call depth for interpolation values"
				);
			}
			count++;
		}
	}

	/**
	 * @notice Calculates the maximum ratio balance factor based on the number of pairs.
	 * @param pairsCount The number of pairs.
	 * @return max The maximum ratio balance factor.
	 */
	function _maxRatioBalanceFactor(
		uint64 pairsCount
	) private pure returns (uint64 max) {
		max = pairsCount * RATIO_BALANCE_FACTOR;
	}

	/**
	 * @notice Computes the pair ratio based on total sales, total liquidity, and the number of pairs.
	 * @param pairTotalSales The total sales amount for the pair.
	 * @param totalLiq The total liquidity across all pairs.
	 * @param pairsCount The number of pairs.
	 * @return ratio The computed pair ratio.
	 */
	function _pairRatio(
		uint256 pairTotalSales,
		uint256 totalLiq,
		uint64 pairsCount
	) private pure returns (uint64 ratio) {
		uint256 value = (pairTotalSales * RATIO_BALANCE_FACTOR) /
			_liqRatio(totalLiq, pairsCount);
		ratio = value.clamp(1, _maxRatioBalanceFactor(pairsCount));
	}

	/**
	 * @notice Computes the liquidity ratio, which is the total sales divided by the number of pairs.
	 * @param sales The total sales amount.
	 * @param pairsCount The number of pairs.
	 * @return gRatio The computed liquidity ratio.
	 */
	function _liqRatio(
		uint256 sales,
		uint64 pairsCount
	) private pure returns (uint256 gRatio) {
		require(pairsCount > 0, "FeeUtil: no available pairs");

		gRatio = sales / pairsCount;
		if (gRatio <= 1) {
			return 1;
		}
	}

	/**
	 * @notice Computes the total fee shares.
	 * @param self The Values struct containing the fee shares.
	 * @return The total fee value.
	 */
	function total(Values memory self) internal pure returns (uint256) {
		return self.toBurnValue + self.referrerValue + self.liqProvidersValue;
	}

	/**
	 * @notice Splits the fee into shares for burning, referrer, and liquidity providers.
	 * @param fee The total fee amount.
	 * @return A Values struct with the split values.
	 */
	function splitFee(uint256 fee) internal pure returns (Values memory) {
		uint256 toBurnValue = (fee * 5_00) / MAX_PERCENT; // 5%
		uint256 referrerValue = (fee * 2_00) / MAX_PERCENT; // 2%
		uint256 liqProvidersValue = fee - toBurnValue - referrerValue;

		return Values(toBurnValue, referrerValue, liqProvidersValue);
	}
}

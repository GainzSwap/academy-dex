// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "./Math.sol";
import "./Number.sol";

library FeeUtil {
	using Number for uint256;

	uint256 constant MAX_PERCENT = 100_00;

	struct Values {
		uint256 toBurnValue;
		uint256 referrerValue;
		uint256 liqProvidersValue;
	}

	/// One to three decimal places
	uint64 constant RATIO_BALANCE_FACTOR = 1_000;

	uint64 constant MIN_FEE = 10;
	uint64 constant FIRST_FEE = 30;
	uint64 constant SECOND_FEE = 3_00;
	uint64 constant THIRD_FEE = uint64(MAX_PERCENT);

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
				maxIn = MAX_RATIO_BALANCE_FACTOR / 5;
				maxOut = SECOND_FEE;
			} else if (count == 1) {
				maxIn = MAX_RATIO_BALANCE_FACTOR;
				maxOut = THIRD_FEE;
			} else {
				revert(
					"Fee._getInterValues: max call depth for interpolation values"
				);
			}
			count++;
		}
	}

	function _maxRatioBalanceFactor(
		uint64 pairsCount
	) private pure returns (uint64 max) {
		max = pairsCount * RATIO_BALANCE_FACTOR;
	}

	function _pairRatio(
		uint256 pairTotalSales,
		uint256 totalLiq,
		uint64 pairsCount
	) private pure returns (uint64 ratio) {
		uint256 value = (pairTotalSales * RATIO_BALANCE_FACTOR) /
			_liqRatio(totalLiq, pairsCount);
		ratio = value.clamp(1, _maxRatioBalanceFactor(pairsCount));
	}

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
	 * @dev Computes the total fee shares.
	 * @param self The fee shares struct.
	 * @return The total fee value.
	 */
	function total(Values memory self) internal pure returns (uint256) {
		return self.toBurnValue + self.referrerValue + self.liqProvidersValue;
	}

	/**
	 * @dev Splits the fee into shares for burning, referrer, and liquidity providers.
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

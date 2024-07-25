// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity 0.8.26;

import "./Math.sol";
import "./Number.sol";

library FeeUtil {
	using Number for uint256;

	/// One to three decimal places
	uint64 constant RATIO_BALANCE_FACTOR = 1_000;

	/// 0.05%
	uint64 constant MIN_FEE = 10;
	uint64 constant FIRST_FEE = 30;
	uint64 constant SECOND_FEE = 5_00;
	uint64 constant THIRD_FEE = 65_00;

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
				maxIn = MAX_RATIO_BALANCE_FACTOR / 3;
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
			_salesPerPair(totalLiq, pairsCount);

		ratio = value.clamp(1, _maxRatioBalanceFactor(pairsCount));
	}

	function _salesPerPair(
		uint256 sales,
		uint64 pairsCount
	) private pure returns (uint256 gRatio) {
		require(pairsCount > 0, "FeeUtil: no available pairs");

		gRatio = sales / pairsCount;
		if (gRatio <= 1) {
			return 1;
		}
	}
}

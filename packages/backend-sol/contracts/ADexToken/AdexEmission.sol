// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "prb-math/contracts/PRBMathSD59x18.sol";

/// @notice Emitted when trying to convert a uint256 number that doesn't fit within int256.
error ToInt256CastOverflow(uint256 number);

/// @notice Emitted when trying to convert a int256 number that doesn't fit within uint256.
error ToUint256CastOverflow(int256 number);

/// @notice Safe cast from uint256 to int256
function toInt256(uint256 x) pure returns (int256 result) {
	if (x > uint256(type(int256).max)) {
		revert ToInt256CastOverflow(x);
	}
	result = int256(x);
}

/// @notice Safe cast from int256 to uint256
function toUint256(int256 x) pure returns (uint256 result) {
	if (x < 0) {
		revert ToUint256CastOverflow(x);
	}
	result = uint256(x);
}

/// @dev see https://github.com/PaulRBerg/prb-math/discussions/50
library AdexEmission {
	using PRBMathSD59x18 for int256;

	int256 private constant DECAY_RATE = 9998e14; // 0.9998 with 18 decimals
	int256 private constant E0 = 2729727036845720116116; // Epoch 0 emission

	/// @notice Computes emission at a specific epoch
	/// @param epoch The epoch to compute emission for
	/// @return Emission value at the given epoch
	function atEpoch(uint256 epoch) internal pure returns (uint256) {
		int256 decayFactor = PRBMathSD59x18.pow(DECAY_RATE, toInt256(epoch));
		return toUint256((E0 * decayFactor) / 1e18);
	}

	/// @notice Computes E0 * (0.9998^epochStart − 0.9998^epochEnd) / ln(0.9998)
	/// @param epochStart the starting epoch
	/// @param epochEnd the end epoch
	/// @return Total emission through the epoch range
	function throughEpochRange(
		uint256 epochStart,
		uint256 epochEnd
	) internal pure returns (uint256) {
		require(epochEnd > epochStart, "Invalid epoch range");

		int256 startFactor = epochDecayFactor(epochStart);
		int256 endFactor = epochDecayFactor(epochEnd);

		int256 totalEmission = (E0 * (startFactor - endFactor)) /
			DECAY_RATE.ln();

		// return the absolute value of totalEmission as uint256
		return toUint256(totalEmission * -1);
	}

	function throughTimeRange(
		uint256 epoch,
		uint256 timeRange,
		uint256 epochLength
	) internal pure returns (uint256) {
		return (atEpoch(epoch) * timeRange) / epochLength;
	}

	function epochDecayFactor(uint256 epoch) private pure returns (int256) {
		return
			PRBMathSD59x18.pow(
				DECAY_RATE,
				// Extrapolate epoch to size with decimal places of DECAY_RATE
				toInt256(epoch) * 1e18
			);
	}
}

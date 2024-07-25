//SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

library MathUtil {
	/// out = (minOut * (maxIn - currentIn) + maxOut * (currentIn - minIn)) / (maxIn - minIn)
	/// https://en.wikipedia.org/wiki/LinearInterpolation
	function linearInterpolation(
		uint256 minIn,
		uint256 maxIn,
		uint256 currentIn,
		uint256 minOut,
		uint256 maxOut
	) internal pure returns (uint256) {
		if (currentIn < minIn || currentIn > maxIn) {
			revert("Math.linearInterpolation: Invalid values");
		}

		uint256 minOutWeighted = minOut * (maxIn - currentIn);
		uint256 maxOutWeighted = maxOut * (currentIn - minIn);
		uint256 inDiff = maxIn - minIn;

		return (minOutWeighted + maxOutWeighted) / inDiff;
	}
}

//SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

library Cmp {
	function min(
		uint256 first,
		uint256 other
	) internal pure returns (uint256 min_) {
		if (first <= other) {
			min_ = first;
		} else {
			min_ = other;
		}
	}
}

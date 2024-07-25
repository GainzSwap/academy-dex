// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity 0.8.26;

library Number {
	/// Restrict a value to a certain interval (Inspired by the `clamp` method in Rust number types).
	///
	/// Returns `max` if `self` is greater than `max`, and `min` if `self` is
	/// less than `min`. Otherwise this returns `self`.
	///
	/// # Panics
	///
	/// Panics if `min > max`.
	///
	function clamp(
		uint256 self,
		uint64 min,
		uint64 max
	) internal pure returns (uint64 clamped) {
		assert(min <= max);
		if (self < min) {
			clamped = min;
		} else if (self > max) {
			clamped = max;
		} else {
			assembly {
				clamped := self
			}
		}
	}
}

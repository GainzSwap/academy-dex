//SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "./Errors.sol";

// TODO use when we can do operator overloading; see https://docs.soliditylang.org/en/v0.8.23/contracts.html#using-for
// type Round is uint256;

uint constant MAX_OBSERVATIONS = 65_536; // 2^{16} records, to optimise binary search

struct PriceObservation {
	uint256 firstTokenReserveAccumulated;
	uint256 secondTokenReserveAccumulated;
	uint256 weightAccumulated;
	// Round recordingRound;
	uint256 recordingRound;
}

struct IndexValue {
	uint keyIndex;
	PriceObservation value;
}

struct priceObsvec {
	mapping(uint => IndexValue) data;
	uint[] keys;
	uint length;
}

library PriceObsVec {
	function isEmpty(
		priceObsvec storage self
	) internal view returns (bool empty) {
		empty = self.length == 0;
	}

	function get(
		priceObsvec storage self,
		uint index
	) internal view returns (PriceObservation memory) {
		if (index > self.length) {
			revert IndexOutOfRangeErrMsg();
		}

		return self.data[index].value;
	}

	function set(
		priceObsvec storage self,
		uint index,
		PriceObservation memory value
	) internal {
		if (index > self.length) {
			revert IndexOutOfRangeErrMsg();
		}

		self.data[index].value = value;
		self.data[index].keyIndex = index;
	}

	/// Add one item at the end of the list.
	/// Returns the index of the newly inserted item, which is also equal to the new number of elements.
	function push(
		priceObsvec storage self,
		PriceObservation memory value
	) internal returns (uint) {
		self.length += 1;

		self.data[self.length].value = value;
		self.data[self.length].keyIndex = self.length;

		return self.length;
	}

	function len(priceObsvec storage self) internal view returns (uint) {
		return self.length;
	}
}

struct SafePriceData {
	uint safePriceCurrentIndex;
	priceObsvec priceObservations;
}

library SafePriceUtil {
	using PriceObsVec for priceObsvec;

	function updateSafePrice(
		SafePriceData storage self,
		uint256 firstTokenReserve,
		uint256 secondTokenReserve
	) internal {
		if (firstTokenReserve == 0 || secondTokenReserve == 0) {
			return;
		}

		uint currentRound = block.number;

		if (self.safePriceCurrentIndex > MAX_OBSERVATIONS) {
			revert ErrorSafePriceCurrentIndex(
				self.safePriceCurrentIndex,
				MAX_OBSERVATIONS
			);
		}

		PriceObservation memory lastPriceObservation;
		uint newIndex = 1;
		if (!self.priceObservations.isEmpty()) {
			lastPriceObservation = self.priceObservations.get(
				self.safePriceCurrentIndex
			);
			newIndex = (self.safePriceCurrentIndex % MAX_OBSERVATIONS) + 1;
		}

		if (lastPriceObservation.recordingRound == currentRound) {
			return;
		}

		PriceObservation memory newPriceObservation = computeNewObservation(
			currentRound,
			firstTokenReserve,
			secondTokenReserve,
			lastPriceObservation
		);

		if (self.priceObservations.len() == MAX_OBSERVATIONS) {
			self.priceObservations.set(newIndex, newPriceObservation);
		} else {
			self.priceObservations.push(newPriceObservation);
		}

		self.safePriceCurrentIndex = newIndex;
	}

	function computeNewObservation(
		uint newRound,
		uint256 newFirstReserve,
		uint256 newSecondReserve,
		PriceObservation memory currentPriceObservation
	) internal pure returns (PriceObservation memory newPriceObservation) {
		uint256 newWeight = currentPriceObservation.recordingRound == 0
			? 1
			: newRound - currentPriceObservation.recordingRound;

		newPriceObservation = currentPriceObservation;
		newPriceObservation.firstTokenReserveAccumulated +=
			newWeight *
			newFirstReserve;
		newPriceObservation.secondTokenReserveAccumulated +=
			newWeight *
			newSecondReserve;
		newPriceObservation.weightAccumulated += newWeight;
		newPriceObservation.recordingRound = newRound;
	}
}

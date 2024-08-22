// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { TokenPayment } from "../../common/libs/TokenPayments.sol";
import { MathUtil } from "../../common/libs/Math.sol";

/// @title GToken Library
/// @notice This library provides functions for managing GToken attributes, including staking, claiming rewards, and calculating stake weights and rewards.
library GToken {
	/// @dev Attributes struct holds the data related to a participant's stake in the GToken contract.
	struct Attributes {
		uint256 rewardPerShare;
		uint256 epochStaked;
		uint256 epochsLocked;
		uint256 lastClaimEpoch;
		uint256 lpAmount;
		uint256 stakeWeight;
		TokenPayment[] lpPayments;
	}

	// Constants for lock periods and percentage loss calculations
	uint256 public constant MIN_EPOCHS_LOCK = 30;
	uint256 public constant MAX_EPOCHS_LOCK = 1080;
	uint256 public constant MIN_EPOCHS_LOCK_PERCENT_LOSS = 55e4; // 55% in basis points
	uint256 public constant MAX_EPOCHS_LOCK_PERCENT_LOSS = 15e4; // 15% in basis points
	uint256 public constant MAX_PERCENT_LOSS = 100e4; // 100% in basis points

	/// @notice Computes the stake weight based on the amount of LP tokens and the epochs locked.
	/// @param self The Attributes struct of the participant.
	/// @return The updated Attributes struct with the computed stake weight.
	function computeStakeWeight(
		Attributes memory self
	) internal pure returns (Attributes memory) {
		uint256 epochsLocked = self.epochsLocked;

		require(
			MIN_EPOCHS_LOCK <= epochsLocked && epochsLocked <= MAX_EPOCHS_LOCK,
			"GToken: Invalid epochsLocked"
		);

		// Calculate stake weight based on LP amount and epochs locked
		self.stakeWeight = self.lpAmount * epochsLocked;

		return self;
	}

	/// @notice Updates the last claim epoch for the participant.
	/// @param self The Attributes struct of the participant.
	/// @param currentEpoch The current epoch to be set as the last claim epoch.
	function setLastClaim(
		Attributes storage self,
		uint256 currentEpoch
	) internal {
		self.lastClaimEpoch = currentEpoch;
	}

	/// @notice Calculates the number of epochs that have elapsed since staking.
	/// @param self The Attributes struct of the participant.
	/// @param currentEpoch The current epoch.
	/// @return The number of epochs elapsed since staking.
	function epochsElapsed(
		Attributes memory self,
		uint256 currentEpoch
	) internal pure returns (uint256) {
		if (currentEpoch <= self.epochStaked) {
			return 0;
		}
		return currentEpoch - self.epochStaked;
	}

	/// @notice Calculates the number of epochs remaining until the stake is unlocked.
	/// @param self The Attributes struct of the participant.
	/// @param currentEpoch The current epoch.
	/// @return The number of epochs remaining until unlock.
	function epochsLeft(
		Attributes memory self,
		uint256 currentEpoch
	) internal pure returns (uint256) {
		uint256 elapsed = epochsElapsed(self, currentEpoch);
		if (elapsed >= self.epochsLocked) {
			return 0;
		}
		return self.epochsLocked - elapsed;
	}

	/// @notice Calculates the number of epochs since the last reward claim.
	/// @param self The Attributes struct of the participant.
	/// @param currentEpoch The current epoch.
	/// @return The number of epochs since the last claim.
	function epochsUnclaimed(
		Attributes storage self,
		uint256 currentEpoch
	) internal view returns (uint256) {
		require(
			currentEpoch >= self.lastClaimEpoch,
			"Invalid last claim epoch"
		);
		return currentEpoch - self.lastClaimEpoch;
	}

	/// @notice Calculates the amount of reward to keep based on epochs elapsed and locked.
	/// @param self The Attributes struct of the participant.
	/// @param reward The total reward amount.
	/// @param currentEpoch The current epoch.
	/// @return The amount of reward to keep after applying penalties.
	function rewardToKeep(
		Attributes storage self,
		uint256 reward,
		uint256 currentEpoch
	) internal view returns (uint256) {
		// Calculate percentage loss based on epochs locked
		uint256 epochsLockedPercentLoss = MathUtil.linearInterpolation(
			MIN_EPOCHS_LOCK,
			MAX_EPOCHS_LOCK,
			self.epochsLocked,
			MIN_EPOCHS_LOCK_PERCENT_LOSS,
			MAX_EPOCHS_LOCK_PERCENT_LOSS
		);

		// Calculate the percentage of the reward to keep after penalties
		uint256 percentLost = epochsElapsedPercentLoss(
			epochsUnclaimed(self, currentEpoch),
			epochsElapsed(self, currentEpoch),
			epochsLockedPercentLoss,
			self.epochsLocked
		);

		uint256 percentToKeep = MAX_PERCENT_LOSS - percentLost;
		return (reward * percentToKeep) / MAX_PERCENT_LOSS;
	}

	/// @notice Calculates the percentage loss of the reward based on elapsed epochs.
	/// @param unclaimed The number of epochs unclaimed.
	/// @param elapsed The number of epochs elapsed since staking.
	/// @param lockedPercentLoss The percentage loss based on epochs locked.
	/// @param locked The total epochs locked.
	/// @return The percentage loss based on epochs elapsed.
	function epochsElapsedPercentLoss(
		uint256 unclaimed,
		uint256 elapsed,
		uint256 lockedPercentLoss,
		uint256 locked
	) private pure returns (uint256) {
		uint256 maxIn = elapsed + (MAX_EPOCHS_LOCK - locked);
		uint256 currentIn = elapsed + unclaimed;
		if (currentIn > maxIn) {
			maxIn = currentIn;
		}
		return
			MathUtil.linearInterpolation(
				0,
				maxIn,
				currentIn,
				lockedPercentLoss,
				0
			);
	}
}

// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import { TokenPayment, TokenPayments } from "../common/libs/TokenPayments.sol";
import { GTokens, GToken } from "./GToken/GToken.sol";
import { Epochs } from "../common/Epochs.sol";

library DeployGovernance {
	function newGovernance(
		address lpToken,
		address adex,
		Epochs.Storage memory epochs
	) external returns (Governance) {
		return new Governance(lpToken, adex, epochs);
	}
}

/// @title Governance Contract
/// @notice This contract handles the governance process by allowing participants to lock LP tokens and mint GTokens.
/// @dev This contract interacts with the GTokens library and manages LP token payments.
contract Governance is ERC1155Holder, Ownable {
	using TokenPayments for TokenPayment;
	using Epochs for Epochs.Storage;

	uint256 constant REWARDS_DIVISION_SAFETY_CONSTANT = 1e18;

	// Reward per share for governance participants
	uint256 public rewardPerShare;
	uint256 public rewardsReserve;

	// Instance of GTokens contract
	GTokens public immutable gtokens;

	// Address of the LP token contract
	address public immutable lpTokenAddress;

	// Address of the Base token contract
	address public immutable adexTokenAddress;

	// Storage for epochs management
	Epochs.Storage epochs;

	// Constants for minimum and maximum LP tokens that can be locked
	uint256 public constant MIN_LP_TOKENS = 1;
	uint256 public constant MAX_LP_TOKENS = 10;

	/// @notice Constructor to initialize the Governance contract.
	/// @param _lpToken The address of the LP token contract.
	/// @param epochs_ The epochs storage instance for managing epochs.
	constructor(
		address _lpToken,
		address _adex,
		Epochs.Storage memory epochs_
	) {
		lpTokenAddress = _lpToken;
		adexTokenAddress = _adex;

		gtokens = new GTokens();
		epochs = epochs_;
	}

	/// @notice Internal function to validate if a TokenPayment is a valid LP token payment.
	/// @param payment The TokenPayment struct to validate.
	/// @return bool indicating if the payment is valid.
	function _isValidLpPayment(
		TokenPayment memory payment
	) internal view returns (bool) {
		return
			payment.nonce > 0 &&
			payment.token == lpTokenAddress &&
			payment.amount > 0;
	}

	/// @notice Function to enter governance by locking LP tokens and minting GTokens.
	/// @param receivedPayments The array of TokenPayment structs sent by the participant.
	/// @param epochsLocked The number of epochs the LP tokens will be locked for.
	function enterGovernance(
		TokenPayment[] calldata receivedPayments,
		uint256 epochsLocked
	) external {
		if (rewardPerShare == 0 && rewardsReserve > 0) {
			// First staker when there's reward must lock for max lock time
			require(
				epochsLocked == GToken.MAX_EPOCHS_LOCK,
				"Governance: Must first stakers must lock for max epoch"
			);
		}

		// Count valid LP token payments
		uint256 paymentsCount = 0;
		for (uint256 i = 0; i < receivedPayments.length; i++) {
			if (_isValidLpPayment(receivedPayments[i])) {
				paymentsCount++;
			}
		}

		// Ensure the number of valid payments is within allowed limits
		require(
			MIN_LP_TOKENS <= paymentsCount && paymentsCount <= MAX_LP_TOKENS,
			"Governance: Invalid LpPayments sent"
		);

		// Build and receive valid LP token payments
		TokenPayment[] memory lpPayments = new TokenPayment[](paymentsCount);
		uint256 lpIndex = 0;
		uint256 lpAmount = 0;
		for (uint256 i = 0; i < receivedPayments.length; i++) {
			TokenPayment memory payment = receivedPayments[i];
			if (_isValidLpPayment(payment)) {
				payment.receiveToken();

				lpAmount += payment.amount;
				lpPayments[lpIndex] = payment;

				lpIndex++;
			}
		}

		// Mint GTokens for the participant
		gtokens.mintGToken(
			msg.sender,
			rewardPerShare,
			epochsLocked,
			lpAmount,
			epochs.currentEpoch(),
			lpPayments
		);
	}

	/**
	 * @notice Receives rewards from the owner (typically Router Contract) and updates rewardPerShare and rewardsReserve.
	 * @param payment The TokenPayment struct containing the reward details.
	 *
	 * The function will:
	 * - Require that the reward amount is greater than zero.
	 * - Require that the token in the payment is the ADEX token.
	 * - Transfer the reward tokens to the contract.
	 * - Update the `rewardPerShare` based on the `rewardAmount` and `totalStakeWeight`.
	 * - Update the `rewardsReserve` with the received reward amount.
	 *
	 * @dev This function reverts if the reward amount is zero, if the payment token is invalid.
	 *
	 * Reverts with:
	 * - "Governance: Reward amount must be greater than zero" if the reward amount is zero.
	 * - "Governance: Invalid payment" if the payment token is not the ADEX token.
	 */
	function receiveRewards(TokenPayment calldata payment) external onlyOwner {
		uint256 rewardAmount = payment.amount;
		require(
			rewardAmount > 0,
			"Governance: Reward amount must be greater than zero"
		);
		require(
			payment.token == adexTokenAddress,
			"Governance: Invalid payment"
		);
		payment.receiveToken();

		uint256 totalStakeWeight = gtokens.totalStakeWeight();
		// We will receive rewards regardless of if Governance staking has begun
		if (totalStakeWeight > 0) {
			rewardPerShare +=
				(rewardAmount * REWARDS_DIVISION_SAFETY_CONSTANT) /
				totalStakeWeight;
		}
		rewardsReserve += rewardAmount;
	}
}

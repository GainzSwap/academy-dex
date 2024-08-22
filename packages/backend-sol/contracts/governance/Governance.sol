// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";

import { TokenPayment, TokenPayments } from "../common/libs/TokenPayments.sol";
import { GTokens } from "./GToken/GToken.sol";
import { Epochs } from "../common/Epochs.sol";

/// @title Governance Contract
/// @notice This contract handles the governance process by allowing participants to lock LP tokens and mint GTokens.
/// @dev This contract interacts with the GTokens library and manages LP token payments.
contract Governance is ERC1155Holder {
	using TokenPayments for TokenPayment;
	using Epochs for Epochs.Storage;

	// Reward per share for governance participants
	uint256 rewardPerShare;

	// Instance of GTokens contract
	GTokens public gtokens;

	// Address of the LP token contract
	address public lpTokenAddress;

	// Storage for epochs management
	Epochs.Storage epochs;

	// Constants for minimum and maximum LP tokens that can be locked
	uint256 public constant MIN_LP_TOKENS = 1;
	uint256 public constant MAX_LP_TOKENS = 10;

	/// @notice Constructor to initialize the Governance contract.
	/// @param _lpToken The address of the LP token contract.
	/// @param epochs_ The epochs storage instance for managing epochs.
	constructor(address _lpToken, Epochs.Storage memory epochs_) {
		lpTokenAddress = _lpToken;
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
}

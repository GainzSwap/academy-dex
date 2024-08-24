// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

import { TokenPayment, TokenPayments, IERC20 } from "../common/libs/TokenPayments.sol";
import { GTokens, GToken, GTOKEN_MINT_AMOUNT } from "./GToken/GToken.sol";
import { Epochs } from "../common/Epochs.sol";

import "../router/IRouter.sol";
import "../common/libs/Number.sol";
import "../common/utils.sol";

import { LpToken } from "../modules/LpToken.sol";
import { DeployLaunchpad, Launchpad } from "./DeployLaunchpad.sol";

import "hardhat/console.sol";

library NewGTokens {
	function create() external returns (GTokens) {
		return new GTokens();
	}
}

/// @title Governance Contract
/// @notice This contract handles the governance process by allowing users to lock LP tokens and mint GTokens.
/// @dev This contract interacts with the GTokens library and manages LP token payments.
contract Governance is ERC1155Holder, Ownable {
	using TokenPayments for TokenPayment;
	using Epochs for Epochs.Storage;
	using GToken for GToken.Attributes;
	using Number for uint256;
	using EnumerableSet for EnumerableSet.UintSet;

	uint256 constant REWARDS_DIVISION_SAFETY_CONSTANT = 1e18;

	// Constants for minimum and maximum LP tokens that can be locked
	uint256 public constant MIN_LP_TOKENS = 1;
	uint256 public constant MAX_LP_TOKENS = 10;

	struct TokenListing {
		uint256 yesVote; // Number of yes votes
		uint256 noVote; // Number of no votes
		uint256 totalLpAmount; // Total LP amount locked for the listing
		uint256 endEpoch; // Epoch when the listing proposal ends
		address owner; // The owner proposing the listing
		uint256 gTokenNonce; // Nonce of the governance token
		TokenPayment tradeTokenPayment; // The token proposed for trading
		uint256 campaignId; // launchpad campaign ID
		address priceDiscoveryAddress; // Address of the price discovery contract
	}

	// This could be set by governance
	uint256 public constant LISTING_FEE = 20e18;

	// Reward per share for governance users
	uint256 public rewardPerShare;
	uint256 public rewardsReserve;

	uint256 public protocolFees;
	address immutable protocolFeesCollector;

	// Instance of GTokens contract
	GTokens public immutable gtokens;

	// Address of the LP token contract
	address public immutable lpTokenAddress;

	// Address of the Base token contract
	address public immutable adexTokenAddress;
	IRouter private immutable _router;

	// Storage for epochs management
	Epochs.Storage public epochs;

	// Mapping of user to their active votes on token listings
	mapping(address => EnumerableSet.UintSet) private _userVotes;

	// Mapping of user to the token they voted for
	mapping(address => address) public userVote;

	// The current active listing
	TokenListing public activeListing;

	// Mapping of token owner to their proposed listing
	mapping(address => TokenListing) public pairOwnerListing;

	Launchpad public launchpad;

	/// @notice Constructor to initialize the Governance contract.
	/// @param _lpToken The address of the LP token contract.
	/// @param _adex The address of the ADEX token contract.
	/// @param epochs_ The epochs storage instance for managing epochs.
	/// @param protocolFeesCollector_ The address to collect protocol fees.
	constructor(
		address _lpToken,
		address _adex,
		Epochs.Storage memory epochs_,
		address protocolFeesCollector_
	) {
		lpTokenAddress = _lpToken;
		adexTokenAddress = _adex;

		gtokens = NewGTokens.create();
		launchpad = DeployLaunchpad.newLaunchpad();
		epochs = epochs_;

		_router = IRouter(msg.sender);

		require(
			protocolFeesCollector_ != address(0),
			"Invalid Protocol Fees collector"
		);
		protocolFeesCollector = protocolFeesCollector_;
	}

	function currentEpoch() public view returns (uint256) {
		return epochs.currentEpoch();
	}

	function takeProtocolFees() external {
		address caller = msg.sender;
		require(caller == protocolFeesCollector, "Not allowed");

		IERC20(adexTokenAddress).transfer(protocolFeesCollector, protocolFees);
		protocolFees = 0;
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

	function _addReward(TokenPayment calldata payment) private {
		uint256 rewardAmount = payment.amount;
		require(
			rewardAmount > 0,
			"Governance: Reward amount must be greater than zero"
		);
		require(
			payment.token == adexTokenAddress,
			"Governance: Invalid reward payment"
		);
		payment.receiveToken();

		uint256 protocolAmount;
		(rewardAmount, protocolAmount) = rewardAmount.take(
			(rewardAmount * 3) / 10
		); // 30% for protocol fee

		uint256 totalStakeWeight = gtokens.totalStakeWeight();
		// We will receive rewards regardless of if Governance staking has begun
		if (totalStakeWeight > 0) {
			rewardPerShare +=
				(rewardAmount * REWARDS_DIVISION_SAFETY_CONSTANT) /
				totalStakeWeight;
		}

		protocolFees += protocolAmount;
		rewardsReserve += rewardAmount;
	}

	/// @notice Function to enter governance by locking LP tokens and minting GTokens.
	/// @param receivedPayments The array of TokenPayment structs sent by the user.
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
		uint256 adexAmount = 0;
		for (uint256 i = 0; i < receivedPayments.length; i++) {
			TokenPayment memory payment = receivedPayments[i];
			if (_isValidLpPayment(payment)) {
				payment.receiveToken();

				lpAmount += payment.amount;
				lpPayments[lpIndex] = payment;

				LpToken.LpAttributes memory attr = LpToken(lpTokenAddress)
					.getBalanceAt(address(this), payment.nonce)
					.attributes;
				if (attr.tradeToken == adexTokenAddress) {
					adexAmount += payment.amount;
				}

				lpIndex++;
			}
		}

		// ADEX is first class token in the DEX, so All GTokens holders must possess sufficient amount based on liq they provided
		require(
			((adexAmount * 100) / lpAmount) >= 10, // 10% for now
			"Not enough ADEX liquidity used"
		);

		// Mint GTokens for the user
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
	 * @dev This function reverts if the reward amount is zero or if the payment token is invalid.
	 *
	 * Reverts with:
	 * - "Governance: Reward amount must be greater than zero" if the reward amount is zero.
	 * - "Governance: Invalid payment" if the payment token is not the ADEX token.
	 */
	function receiveRewards(TokenPayment calldata payment) external onlyOwner {
		_addReward(payment);
	}

	function _calculateClaimableReward(
		address user,
		uint256 nonce
	)
		internal
		view
		returns (uint256 claimableReward, GToken.Attributes memory attributes)
	{
		attributes = gtokens.getBalanceAt(user, nonce).attributes;

		// Calculate the difference in reward per share since the last claim
		uint256 rewardDifference = rewardPerShare - attributes.rewardPerShare;

		claimableReward =
			(attributes.stakeWeight * rewardDifference) /
			REWARDS_DIVISION_SAFETY_CONSTANT;
	}

	/// @notice Allows a user to claim their accumulated rewards based on their current stake.
	/// @dev This function will transfer the calculated claimable reward to the user,
	/// update the user's reward attributes, and decrease the rewards reserve.
	/// @param nonce The specific nonce representing a unique staking position of the user.
	/// @return Updated staking attributes for the user after claiming the reward.
	function claimRewards(uint256 nonce) external returns (uint256) {
		address user = msg.sender;
		(
			uint256 claimableReward,
			GToken.Attributes memory attributes
		) = _calculateClaimableReward(user, nonce);
		uint256[] memory nonces = _getLpNonces(attributes);
		(uint256 lpRewardsClaimed, uint256[] memory newLpNonces) = _router
			.claimRewards(nonces);

		uint256 total = claimableReward + lpRewardsClaimed;
		require(total > 0, "Governance: No rewards to claim");

		if (claimableReward > 0) {
			// Reduce the rewards reserve by the claimed amount
			rewardsReserve -= claimableReward;
			// Update user's rewardPerShare to the current rewardPerShare
			attributes.rewardPerShare = rewardPerShare;
			attributes.lastClaimEpoch = epochs.currentEpoch();
		}

		if (lpRewardsClaimed > 0) {
			for (uint256 i = 0; i < newLpNonces.length; i++) {
				attributes.lpPayments[i].nonce = newLpNonces[i];
			}
		}

		// Transfer the claimable reward to the user
		IERC20(adexTokenAddress).transfer(user, total);

		return gtokens.update(user, nonce, GTOKEN_MINT_AMOUNT, attributes);
	}

	function increaseEpochsLocked(
		uint256 nonce,
		uint256 extraEpochs
	) external returns (GToken.Attributes memory attributes) {
		address user = msg.sender;

		{
			uint256 claimableReward;

			(claimableReward, attributes) = _calculateClaimableReward(
				user,
				nonce
			);

			if (claimableReward > 0) {
				nonce = this.claimRewards(nonce);
				attributes = gtokens.getBalanceAt(user, nonce).attributes;
			}
		}

		attributes.epochsLocked += extraEpochs;
		if (attributes.epochsLocked > GToken.MAX_EPOCHS_LOCK) {
			attributes.epochsLocked = GToken.MAX_EPOCHS_LOCK;
		}

		gtokens.update(user, nonce, GTOKEN_MINT_AMOUNT, attributes);
	}

	function _getLpNonces(
		GToken.Attributes memory attributes
	) internal pure returns (uint256[] memory nonces) {
		uint256 totalNonces = attributes.lpPayments.length;
		nonces = new uint256[](totalNonces);
		for (uint256 i = 0; i < totalNonces; i++) {
			nonces[i] = attributes.lpPayments[i].nonce;
		}
	}

	function getClaimableRewards(
		address user,
		uint256 nonce
	) external view returns (uint256 totalClaimable) {
		GToken.Attributes memory attributes;

		(totalClaimable, attributes) = _calculateClaimableReward(user, nonce);

		uint256[] memory nonces = _getLpNonces(attributes);
		totalClaimable += _router.getClaimableRewardsByNonces(nonces);
	}

	/// @notice Exits governance by burning GTokens and unlocking the user's staked LP tokens.
	/// @param nonce The nonce representing the user's specific staking position.
	function exitGovernance(uint256 nonce) external {
		address user = msg.sender;

		// Retrieve the user's GToken attributes for the specified nonce
		GToken.Attributes memory attributes = gtokens
			.getBalanceAt(user, nonce)
			.attributes;

		// Calculate the amount of LP tokens to return to the user
		uint256 lpAmountToReturn = attributes.valueToKeep(
			attributes.lpAmount,
			attributes.epochsElapsed(epochs.currentEpoch())
		);
		TokenPayment[] memory lpPayments = attributes.lpPayments;
		// Process each LP payment associated with the staking position
		for (uint256 i; i < lpPayments.length; i++) {
			TokenPayment memory lpPayment = lpPayments[i];

			// Adjust the LP payment amount based on the remaining LP amount to return
			if (lpAmountToReturn == 0) {
				lpPayment.amount = 0;
				lpPayment.nonce = 0;
			} else if (lpAmountToReturn > lpPayment.amount) {
				lpAmountToReturn -= lpPayment.amount;
			} else {
				lpPayment.amount = lpAmountToReturn;
				lpAmountToReturn = 0;
			}

			// Transfer the LP tokens back to the user if there's an amount to return
			if (lpPayment.amount > 0) {
				LpToken(lpTokenAddress).safeTransferFrom(
					address(this),
					user,
					lpPayment.nonce,
					lpPayment.amount,
					""
				);
			}
		}

		// Burn the user's GToken by setting the amount to 0
		gtokens.update(user, nonce, 0, attributes);
	}

	/// @notice Proposes a new pair listing by submitting the required listing fee and GToken payment.
	/// @param listingFeePayment The payment details for the listing fee.
	/// @param gTokenPayment The payment details for the GToken required for the listing.
	/// @param tradeTokenPayment The the trade token to be listed with launchpad distribution amount, if any.
	function proposeNewPairListing(
		TokenPayment calldata listingFeePayment,
		TokenPayment calldata gTokenPayment,
		TokenPayment calldata tradeTokenPayment
	) external {
		address tradeToken = tradeTokenPayment.token;

		// Ensure there is no active listing proposal
		require(
			pairOwnerListing[msg.sender].owner == address(0) &&
				activeListing.owner == address(0),
			"Governance: Previous proposal not completed"
		);

		// Validate the trade token and ensure it is not already listed
		require(
			isERC20(tradeToken) && !_router.tokenIsListed(tradeToken),
			"Governance: Invalid Trade token"
		);
		// Check if the correct listing fee amount is provided
		require(
			listingFeePayment.amount == LISTING_FEE,
			"Governance: Invalid sent listing fee"
		);
		// Add the listing fee to the rewards pool
		_addReward(listingFeePayment);

		// Validate the GToken payment for the listing
		require(
			_isValidGTokenForListing(gTokenPayment),
			"Governance: Invalid GToken Payment for proposal"
		);
		// Process the GToken payment
		gTokenPayment.receiveToken();

		if (tradeTokenPayment.amount > 0) {
			tradeTokenPayment.receiveToken();
		}

		// Update the active listing with the new proposal details
		activeListing.owner = msg.sender;
		activeListing.tradeTokenPayment = tradeTokenPayment;
		activeListing.gTokenNonce = gTokenPayment.nonce;
		activeListing.endEpoch = currentEpoch() + 3;
	}

	/// @notice Validates the GToken payment for the listing based on the total base amount in liquidity.
	/// @param payment The payment details for the GToken.
	/// @return bool indicating if the GToken payment is valid.
	function _isValidGTokenForListing(
		TokenPayment calldata payment
	) private view returns (bool) {
		// Ensure the payment token is the correct GToken contract
		if (payment.token != address(gtokens)) {
			return false;
		}

		// Retrieve the GToken attributes for the specified nonce
		GToken.Attributes memory attributes = gtokens
			.getBalanceAt(msg.sender, payment.nonce)
			.attributes;

		uint256 totalBaseAmtInLiq = 0;
		// Iterate through the LP payments to calculate the total base amount in liquidity
		for (uint256 i; i < attributes.lpPayments.length; i++) {
			TokenPayment memory lpPayment = attributes.lpPayments[i];
			LpToken.LpBalance memory lpBalance = LpToken(lpTokenAddress)
				.getBalanceAt(address(this), lpPayment.nonce);

			// Accumulate the base amount if the trade token matches the specified address
			if (lpBalance.attributes.tradeToken == adexTokenAddress) {
				totalBaseAmtInLiq += lpBalance.amount;
			}

			// Return true if the total base amount meets the required threshold
			if (totalBaseAmtInLiq >= 1000e18) {
				return true;
			}
		}

		// Return false if the total base amount is insufficient
		return false;
	}

	function _checkProposalPass(
		uint256 value,
		uint256 thresholdValue
	) private pure returns (bool) {
		return thresholdValue > 0 && value >= (thresholdValue * 86) / 100;
	}

	function _returnListingGToken(TokenListing memory listing) internal {
		gtokens.safeTransferFrom(
			address(this),
			listing.owner,
			listing.gTokenNonce,
			1,
			""
		);

		if (listing.tradeTokenPayment.amount > 0) {
			listing.tradeTokenPayment.sendToken(listing.owner);
		}
		delete pairOwnerListing[msg.sender];
	}

	/**
	 * @notice Proceeds with the next stage of a new pair listing, either launching a token or proceeding to price discovery.
	 */
	function proceedNewPairListing() external {
		TokenListing storage listing = pairOwnerListing[msg.sender];

		// If no listing is found for the sender, end the current voting session.
		if (listing.owner == address(0)) {
			_endVoting();
			listing = pairOwnerListing[msg.sender]; // Refresh listing after ending the vote
		}

		// Ensure that a valid listing exists.
		require(listing.owner != address(0), "No listing found");

		bool canProceed = _checkProposalPass(
			listing.totalLpAmount,
			gtokens.totalLpAmount()
		) &&
			_checkProposalPass(
				listing.yesVote,
				listing.yesVote + listing.noVote
			);
		if (!canProceed) {
			// Proposal failed, not accepted by community

			_returnListingGToken(listing);

			return;
		}

		// Handle the launch pad and price discovery stages.
		if (listing.tradeTokenPayment.amount > 0) {
			require(
				listing.priceDiscoveryAddress == address(0),
				"Already in Price Discovery"
			);
			listing.tradeTokenPayment.approve(address(launchpad));
			listing.campaignId = launchpad.createCampaign(
				listing.tradeTokenPayment,
				listing.owner
			);
			// Update amount to indicate transfer and possibly ready to move to price discovery
			listing.tradeTokenPayment.amount = 0;
		} else if (listing.priceDiscoveryAddress == address(0)) {
			if (listing.campaignId != 0) {
				Launchpad.CampaignStatus campaignStatus = launchpad
					.getCampaignDetails(listing.campaignId)
					.status;

				if (campaignStatus != Launchpad.CampaignStatus.Success) {
					if (campaignStatus == Launchpad.CampaignStatus.Failed) {
						_returnListingGToken(listing);
					}

					return;
				}
			}
			// Logic to deploy the price discovery contract.
		} else {
			// Logic to confirm that price discovery is complete and list the pair with initial liquidity transfer.
		}
	}

	/**
	 * @notice Allows users to vote on whether a new token pair should be listed.
	 * @param gTokenPayment The gToken payment details used for voting.
	 * @param tradeToken The address of the trade token being voted on.
	 * @param shouldList A boolean indicating the user's vote (true for yes, false for no).
	 */
	function vote(
		TokenPayment calldata gTokenPayment,
		address tradeToken,
		bool shouldList
	) external {
		address user = msg.sender;

		// Ensure that the trade token is valid and active for voting.
		require(
			isERC20(tradeToken) &&
				activeListing.tradeTokenPayment.token == tradeToken,
			"Token not active"
		);
		require(
			gTokenPayment.token == address(gtokens),
			"Governance: Invalid Payment"
		);

		// Calculate the user's vote power based on their gToken attributes.
		GToken.Attributes memory attributes = gtokens
			.getBalanceAt(user, gTokenPayment.nonce)
			.attributes;
		uint256 epochsLeft = attributes.epochsLeft(
			attributes.epochsElapsed(epochs.currentEpoch())
		);

		require(
			epochsLeft >= 360,
			"GToken expired, must have atleast 360 epochs left to vote with"
		);

		uint256 votePower = attributes.votePower(epochsLeft);

		// Receive the gToken payment and record the user's vote.
		gTokenPayment.receiveToken();
		_userVotes[user].add(gTokenPayment.nonce);

		// Apply the user's vote to the active listing.
		if (shouldList) {
			activeListing.yesVote += votePower;
		} else {
			activeListing.noVote += votePower;
		}

		// Update the total LP amount and record the user's vote for the trade token.
		activeListing.totalLpAmount += attributes.lpAmount;
		userVote[user] = tradeToken;
	}

	/**
	 * @notice Ends the voting process for the active token listing.
	 * @dev This function ensures that the voting period has ended before finalizing the listing.
	 */
	function _endVoting() private {
		require(
			activeListing.endEpoch <= currentEpoch(),
			"Voting not complete"
		);

		// Finalize the listing and store it under the owner's address.
		pairOwnerListing[activeListing.owner] = activeListing;
		delete activeListing; // Clear the active listing to prepare for the next one.
	}

	/**
	 * @notice Allows users to recall their vote tokens after voting has ended or been canceled.
	 */
	function recallVoteToken() external {
		address user = msg.sender;
		address tradeToken = userVote[user];
		EnumerableSet.UintSet storage userVoteNonces = _userVotes[user];

		// Ensure the user has votes to recall.
		require(userVoteNonces.length() > 0, "No vote found");

		if (tradeToken != address(0)) {
			delete userVote[user]; // Clear the user's vote record.
			if (tradeToken == activeListing.tradeTokenPayment.token)
				_endVoting();
		}

		// Recall up to 10 vote tokens at a time.
		uint256 count = 0;
		while (count < 10 && userVoteNonces.length() > 0) {
			count++;

			uint256 nonce = userVoteNonces.at(userVoteNonces.length() - 1);
			userVoteNonces.remove(nonce);
			gtokens.safeTransferFrom(address(this), user, nonce, 1, "");
		}
	}
}

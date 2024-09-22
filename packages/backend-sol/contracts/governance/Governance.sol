// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import { ERC1155HolderUpgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC1155/utils/ERC1155HolderUpgradeable.sol";
import { OwnableUpgradeable } from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import { TransparentUpgradeableProxy } from "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";

import { TokenPayment, TokenPayments, IERC20 } from "../common/libs/TokenPayments.sol";
import { GTokens, GToken, GTOKEN_MINT_AMOUNT } from "./GToken/GToken.sol";
import { Epochs } from "../common/Epochs.sol";

import "../router/IRouter.sol";
import "../common/libs/Number.sol";
import "../common/utils.sol";

import { LpToken } from "../modules/LpToken.sol";
import { DeployLaunchPair, LaunchPair } from "./DeployLaunchPair.sol";

library NewGTokens {
	function create(
		Epochs.Storage memory epochs,
		address initialOwner,
		address proxyAdmin
	) external returns (GTokens) {
		address gTokensImplementation = address(new GTokens());

		// Deploy TransparentUpgradeableProxy for GTokens
		TransparentUpgradeableProxy proxy = new TransparentUpgradeableProxy(
			gTokensImplementation, // GTokens implementation address
			proxyAdmin, // Address that will act as the admin of the proxy
			abi.encodeWithSelector(
				GTokens.initialize.selector,
				epochs,
				initialOwner
			) // Data for initialization
		);

		// Cast the proxy to the GTokens type and return it
		return GTokens(address(proxy));
	}
}

uint256 constant REWARDS_DIVISION_SAFETY_CONSTANT = 1e18;
uint256 constant LISTING_FEE = 20e18;

library GovernanceLib {
	using Epochs for Epochs.Storage;
	using GToken for GToken.Attributes;
	using TokenPayments for TokenPayment;
	using Number for uint256;
	using EnumerableSet for EnumerableSet.AddressSet;

	/// @notice Validates the LP payment for the listing based on the total ADEX amount in liquidity.
	/// @param payment The payment details for the LP.
	/// @return bool indicating if the LP payment is valid.
	function _isValidLpPaymentForListing(
		TokenPayment calldata payment,
		address lpTokenAddress,
		address adexTokenAddress
	) private view returns (bool) {
		// Ensure the payment token is the correct GToken contract
		if (payment.token != lpTokenAddress) {
			return false;
		}

		// Retrieve the GToken attributes for the specified nonce
		LpToken.LpAttributes memory attributes = LpToken(lpTokenAddress)
			.getBalanceAt(msg.sender, payment.nonce)
			.attributes;

		return
			attributes.tradeToken == adexTokenAddress &&
			payment.amount >= 1_000e18;
	}

	/**
	 * @notice Ends the voting process for the active token listing.
	 * @dev This function ensures that the voting period has ended before finalizing the listing.
	 */
	function endVoting(Governance.MainStorage storage $) public {
		require(
			$.activeListing.endEpoch <= $.epochs.currentEpoch(),
			"Voting not complete"
		);

		// Finalize the listing and store it under the owner's address.
		$.pairOwnerListing[$.activeListing.owner] = $.activeListing;
		delete $.activeListing; // Clear the active listing to prepare for the next one.
	}

	function addReward(
		Governance.MainStorage storage $,
		TokenPayment calldata payment
	) public {
		uint256 rewardAmount = payment.amount;
		require(
			rewardAmount > 0,
			"Governance: Reward amount must be greater than zero"
		);
		require(
			payment.token == $.adexTokenAddress,
			"Governance: Invalid reward payment"
		);
		payment.receiveToken();

		uint256 protocolAmount;
		(rewardAmount, protocolAmount) = rewardAmount.take(
			(rewardAmount * 3) / 10
		); // 30% for protocol fee

		uint256 totalStakeWeight = $.gtokens.totalStakeWeight();
		if (totalStakeWeight > 0) {
			$.rewardPerShare +=
				(rewardAmount * REWARDS_DIVISION_SAFETY_CONSTANT) /
				totalStakeWeight;
		}

		$.protocolFees += protocolAmount;
		$.rewardsReserve += rewardAmount;
	}

	function exitGovernance(
		Governance.MainStorage storage $,
		uint256 nonce
	) external {
		address user = msg.sender;

		GToken.Attributes memory attributes = $
			.gtokens
			.getBalanceAt(user, nonce)
			.attributes;

		// Calculate the amount of LP tokens to return to the user
		uint256 lpAmountToReturn = attributes.valueToKeep(
			attributes.lpAmount,
			attributes.epochsElapsed($.epochs.currentEpoch())
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
				LpToken($.lpTokenAddress).safeTransferFrom(
					address(this),
					user,
					lpPayment.nonce,
					lpPayment.amount,
					""
				);
			}
		}

		$.gtokens.update(user, nonce, 0, attributes);
	}

	function proposeNewPairListing(
		Governance.MainStorage storage $,
		TokenPayment calldata listingFeePayment,
		TokenPayment calldata securityPayment,
		TokenPayment calldata tradeTokenPayment
	) external {
		endVoting($);

		address tradeToken = tradeTokenPayment.token;

		// Ensure there is no active listing proposal
		require(
			$.pairOwnerListing[msg.sender].owner == address(0) &&
				$.activeListing.owner == address(0),
			"Governance: Previous proposal not completed"
		);

		// Validate the trade token and ensure it is not already listed
		bool isNewAddition = $.pendingOrListedTokens.add(tradeToken);
		require(
			isERC20(tradeToken) &&
				isNewAddition &&
				!$.router.tokenIsListed(tradeToken),
			"Governance: Invalid Trade token"
		);

		// Check if the correct listing fee amount is provided
		require(
			listingFeePayment.amount == LISTING_FEE,
			"Governance: Invalid sent listing fee"
		);
		// Add the listing fee to the rewards pool
		addReward($, listingFeePayment);

		require(
			_isValidLpPaymentForListing(
				securityPayment,
				$.lpTokenAddress,
				$.adexTokenAddress
			),
			"Governance: Invalid LP Payment for proposal"
		);
		securityPayment.receiveToken();

		require(
			tradeTokenPayment.amount > 0,
			"Governance: Must send potential initial liquidity"
		);
		tradeTokenPayment.receiveToken();

		// Update the active listing with the new proposal details
		$.activeListing.owner = msg.sender;
		$.activeListing.tradeTokenPayment = tradeTokenPayment;
		$.activeListing.securityLpPayment = securityPayment;
		$.activeListing.endEpoch = $.epochs.currentEpoch() + 3;
	}
}

/// @title Governance Contract
/// @notice This contract handles the governance process by allowing users to lock LP tokens and mint GTokens.
/// @dev This contract interacts with the GTokens library and manages LP token payments.
contract Governance is ERC1155HolderUpgradeable, OwnableUpgradeable {
	using TokenPayments for TokenPayment;
	using Epochs for Epochs.Storage;
	using GToken for GToken.Attributes;
	using Number for uint256;
	using EnumerableSet for EnumerableSet.UintSet;
	using EnumerableSet for EnumerableSet.AddressSet;

	// Constants for minimum and maximum LP tokens that can be locked
	uint256 public constant MIN_LP_TOKENS = 1;
	uint256 public constant MAX_LP_TOKENS = 10;

	struct TokenListing {
		uint256 yesVote; // Number of yes votes
		uint256 noVote; // Number of no votes
		uint256 totalLpAmount; // Total LP amount locked for the listing
		uint256 endEpoch; // Epoch when the listing proposal ends
		address owner; // The owner proposing the listing
		TokenPayment securityLpPayment;
		TokenPayment tradeTokenPayment; // The token proposed for trading
		uint256 campaignId; // launchPair campaign ID
	}

	/// @custom:storage-location erc7201:adex.governance.main
	struct MainStorage {
		uint256 rewardPerShare;
		uint256 rewardsReserve;
		uint256 protocolFees;
		address protocolFeesCollector;
		GTokens gtokens;
		address lpTokenAddress;
		address adexTokenAddress;
		IRouter router;
		Epochs.Storage epochs;
		mapping(address => EnumerableSet.UintSet) userVotes;
		mapping(address => address) userVote;
		TokenListing activeListing;
		EnumerableSet.AddressSet pendingOrListedTokens;
		mapping(address => TokenListing) pairOwnerListing;
		LaunchPair launchPair;
	}

	// keccak256(abi.encode(uint256(keccak256("adex.governance.main")) - 1)) & ~bytes32(uint256(0xff));
	bytes32 private constant MAIN_STORAGE_LOCATION =
		0x7fb362e6a2f486ec4cf1c2b1e6f78b640a158f866a4ba65c099da760ade11e00;

	function _getMainStorage() private pure returns (MainStorage storage $) {
		assembly {
			$.slot := MAIN_STORAGE_LOCATION
		}
	}

	/// @notice Constructor to initialize the Governance contract.
	/// @param _lpToken The address of the LP token contract.
	/// @param _adex The address of the ADEX token contract.
	/// @param epochs_ The epochs storage instance for managing epochs.
	/// @param protocolFeesCollector_ The address to collect protocol fees.
	function initialize(
		address _lpToken,
		address _adex,
		Epochs.Storage memory epochs_,
		address protocolFeesCollector_,
		address router,
		address proxyAdmin
	) public initializer {
		__Ownable_init(msg.sender);

		MainStorage storage $ = _getMainStorage();

		$.lpTokenAddress = _lpToken;
		$.adexTokenAddress = _adex;

		$.epochs = epochs_;
		$.gtokens = NewGTokens.create($.epochs, address(this), proxyAdmin);
		$.launchPair = DeployLaunchPair.newLaunchPair(_lpToken, proxyAdmin);

		$.router = IRouter(router);

		require(
			protocolFeesCollector_ != address(0),
			"Invalid Protocol Fees collector"
		);
		$.protocolFeesCollector = protocolFeesCollector_;
	}

	function currentEpoch() public view returns (uint256) {
		MainStorage storage $ = _getMainStorage();
		return $.epochs.currentEpoch();
	}

	function takeProtocolFees() external {
		MainStorage storage $ = _getMainStorage();
		address caller = msg.sender;
		require(caller == $.protocolFeesCollector, "Not allowed");

		IERC20($.adexTokenAddress).transfer(
			$.protocolFeesCollector,
			$.protocolFees
		);
		$.protocolFees = 0;
	}

	/// @notice Internal function to validate if a TokenPayment is a valid LP token payment.
	/// @param payment The TokenPayment struct to validate.
	/// @return bool indicating if the payment is valid.
	function _isValidLpPayment(
		TokenPayment memory payment
	) internal view returns (bool) {
		MainStorage storage $ = _getMainStorage();
		return
			payment.nonce > 0 &&
			payment.token == $.lpTokenAddress &&
			payment.amount > 0;
	}

	/// @notice Function to enter governance by locking LP tokens and minting GTokens.
	/// @param receivedPayments The array of TokenPayment structs sent by the user.
	/// @param epochsLocked The number of epochs the LP tokens will be locked for.
	function enterGovernance(
		TokenPayment[] calldata receivedPayments,
		uint256 epochsLocked
	) external returns (uint256) {
		MainStorage storage $ = _getMainStorage();
		if ($.rewardPerShare == 0 && $.rewardsReserve > 0) {
			require(
				epochsLocked == GToken.MAX_EPOCHS_LOCK,
				"Governance: First stakers must lock for max epoch"
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

				LpToken.LpAttributes memory attr = LpToken($.lpTokenAddress)
					.getBalanceAt(address(this), payment.nonce)
					.attributes;
				if (attr.tradeToken == $.adexTokenAddress) {
					adexAmount += payment.amount;
				}

				lpIndex++;
			}
		}

		if (msg.sender != address(this)) {
			// ADEX is first class token in the DEX, so All GTokens holders must possess sufficient amount based on liq they provided
			require(
				((adexAmount * 100) / lpAmount) >= 10,
				"Not enough ADEX liquidity used"
			);
		}

		// Mint GTokens for the user
		return
			$.gtokens.mintGToken(
				msg.sender,
				$.rewardPerShare,
				epochsLocked,
				lpAmount,
				$.epochs.currentEpoch(),
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
		GovernanceLib.addReward(_getMainStorage(), payment);
	}

	function _calculateClaimableReward(
		address user,
		uint256 nonce
	)
		internal
		view
		returns (uint256 claimableReward, GToken.Attributes memory attributes)
	{
		MainStorage storage $ = _getMainStorage();
		attributes = $.gtokens.getBalanceAt(user, nonce).attributes;

		uint256 rewardDifference = $.rewardPerShare - attributes.rewardPerShare;
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
		MainStorage storage $ = _getMainStorage();
		address user = msg.sender;
		(
			uint256 claimableReward,
			GToken.Attributes memory attributes
		) = _calculateClaimableReward(user, nonce);
		uint256[] memory nonces = _getLpNonces(attributes);
		(uint256 lpRewardsClaimed, uint256[] memory newLpNonces) = $
			.router
			.claimRewards(nonces);

		uint256 total = claimableReward + lpRewardsClaimed;
		require(total > 0, "Governance: No rewards to claim");

		if (claimableReward > 0) {
			$.rewardsReserve -= claimableReward;
			attributes.rewardPerShare = $.rewardPerShare;
			attributes.lastClaimEpoch = $.epochs.currentEpoch();
		}

		if (lpRewardsClaimed > 0) {
			for (uint256 i = 0; i < newLpNonces.length; i++) {
				attributes.lpPayments[i].nonce = newLpNonces[i];
			}
		}

		IERC20($.adexTokenAddress).transfer(user, total);
		return $.gtokens.update(user, nonce, GTOKEN_MINT_AMOUNT, attributes);
	}

	function increaseEpochsLocked(
		uint256 nonce,
		uint256 extraEpochs
	) external returns (GToken.Attributes memory attributes) {
		MainStorage storage $ = _getMainStorage();
		address user = msg.sender;

		{
			uint256 claimableReward;

			(claimableReward, attributes) = _calculateClaimableReward(
				user,
				nonce
			);

			if (claimableReward > 0) {
				nonce = this.claimRewards(nonce);
				attributes = $.gtokens.getBalanceAt(user, nonce).attributes;
			}
		}

		attributes.epochsLocked += extraEpochs;
		if (attributes.epochsLocked > GToken.MAX_EPOCHS_LOCK) {
			attributes.epochsLocked = GToken.MAX_EPOCHS_LOCK;
		}

		$.gtokens.update(user, nonce, GTOKEN_MINT_AMOUNT, attributes);
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
		MainStorage storage $ = _getMainStorage();
		GToken.Attributes memory attributes;

		(totalClaimable, attributes) = _calculateClaimableReward(user, nonce);

		uint256[] memory nonces = _getLpNonces(attributes);
		totalClaimable += $.router.getClaimableRewardsByNonces(nonces);
	}

	/// @notice Exits governance by burning GTokens and unlocking the user's staked LP tokens.
	/// @param nonce The nonce representing the user's specific staking position.
	function exitGovernance(uint256 nonce) external {
		GovernanceLib.exitGovernance(_getMainStorage(), nonce);
	}

	/// @notice Proposes a new pair listing by submitting the required listing fee and GToken payment.
	/// @param listingFeePayment The payment details for the listing fee.
	/// @param securityPayment The ADEX payment as security deposit
	/// @param tradeTokenPayment The the trade token to be listed with launchPair distribution amount, if any.
	function proposeNewPairListing(
		TokenPayment calldata listingFeePayment,
		TokenPayment calldata securityPayment,
		TokenPayment calldata tradeTokenPayment
	) external {
		GovernanceLib.proposeNewPairListing(
			_getMainStorage(),
			listingFeePayment,
			securityPayment,
			tradeTokenPayment
		);
	}

	function _checkProposalPass(
		uint256 value,
		uint256 thresholdValue
	) private pure returns (bool) {
		return thresholdValue > 0 && value >= (thresholdValue * 86) / 100;
	}

	function _returnListingDeposits(TokenListing memory listing) internal {
		listing.securityLpPayment.sendToken(listing.owner);

		if (listing.tradeTokenPayment.amount > 0) {
			listing.tradeTokenPayment.sendToken(listing.owner);
		}
		delete _getMainStorage().pairOwnerListing[msg.sender];
		_getMainStorage().pendingOrListedTokens.remove(
			listing.tradeTokenPayment.token
		);
	}

	function getPendingOrListedTokens() public view returns (address[] memory) {
		return _getMainStorage().pendingOrListedTokens.values();
	}

	function _createFundRaisingCampaignForListing(
		TokenListing storage listing
	) private returns (bool) {
		require(
			listing.campaignId == 0,
			"Governance: Campaign Created already for Listing"
		);

		MainStorage storage $ = _getMainStorage();

		// Check if the proposal passes both the total LP amount and the voting requirements.
		bool passedForTotalGTokenLp = _checkProposalPass(
			listing.totalLpAmount,
			$.gtokens.totalLpAmount()
		);
		bool passedForYesVotes = _checkProposalPass(
			listing.yesVote,
			listing.yesVote + listing.noVote
		);
		if (!(passedForTotalGTokenLp && passedForYesVotes)) {
			// If the proposal did not pass, return the deposits to the listing owner.
			_returnListingDeposits(listing);
			return false;
		}

		// Create a new campaign for the listing owner.
		listing.campaignId = $.launchPair.createCampaign(listing.owner);
		return true;
	}

	/**
	 * @notice Progresses the new pair listing process for the calling address.
	 *         This function handles the various stages of the listing, including
	 *         voting, launch pad campaign, and liquidity provision.
	 */
	function progressNewPairListing() external {
		MainStorage storage $ = _getMainStorage();

		// Retrieve the token listing associated with the caller's address.
		TokenListing storage listing = $.pairOwnerListing[msg.sender];

		// If no listing is found for the sender, end the current voting session.
		if (listing.owner == address(0)) {
			GovernanceLib.endVoting($); // End the current voting session if no valid listing exists.
			listing = $.pairOwnerListing[msg.sender]; // Refresh listing after ending the vote.
		}

		// Ensure that a valid listing exists after the potential refresh.
		require(listing.owner != address(0), "No listing found");

		if (listing.campaignId == 0) {
			_createFundRaisingCampaignForListing(listing);
		} else {
			// Retrieve details of the existing campaign.
			LaunchPair.Campaign memory campaign = $
				.launchPair
				.getCampaignDetails(listing.campaignId);

			if (campaign.goal > 0 && block.timestamp > campaign.deadline) {
				if (campaign.fundsRaised < campaign.goal) {
					campaign.status = LaunchPair.CampaignStatus.Failed;
				} else {
					campaign.status = LaunchPair.CampaignStatus.Success;
				}
			}

			// Check the campaign status.
			if (campaign.status != LaunchPair.CampaignStatus.Success) {
				// If the campaign failed, return the deposits to the listing owner.
				if (campaign.status == LaunchPair.CampaignStatus.Failed) {
					_returnListingDeposits(listing);
					return;
				}

				// If the campaign is not complete, revert the transaction.
				revert("Governance: Funding not complete");
			}

			// If the campaign is successful and funds have not been withdrawn.
			if (!campaign.isWithdrawn) {
				// Store the current balance of the contract before withdrawing funds.
				uint256 ethBal = address(this).balance;

				// Withdraw the funds raised in the campaign.
				uint256 fundsRaised = $.launchPair.withdrawFunds(
					listing.campaignId
				);

				// Ensure that the funds were successfully withdrawn.
				require(
					ethBal + fundsRaised == address(this).balance,
					"Governance: Funds not withdrawn for campaign"
				);

				// Add liquidity to the router with the withdrawn funds.
				uint256 lpNonce = $.router.addLiquidity{ value: fundsRaised }(
					TokenPayment({ token: address(0), amount: 0, nonce: 0 })
				);

				// Get the LP token balance resulting from the liquidity addition.
				uint256 lpAmount = LpToken($.lpTokenAddress)
					.getBalanceAt(address(this), lpNonce)
					.amount;

				// Prepare the payments array for entering governance.
				TokenPayment[] memory payments = new TokenPayment[](2);
				payments[0] = listing.securityLpPayment;
				payments[1] = TokenPayment({
					amount: lpAmount,
					nonce: lpNonce,
					token: $.lpTokenAddress
				});

				// Enter governance with the provided payments and lock the GTokens.
				uint256 gTokenNonce = this.enterGovernance(
					payments,
					GToken.MAX_EPOCHS_LOCK
				);

				// Transfer the minted GTokens to the listing owner.
				$.gtokens.safeTransferFrom(
					address(this),
					listing.owner,
					gTokenNonce,
					GTOKEN_MINT_AMOUNT,
					""
				);

				// Clear the security LP payment after successful governance entry.
				delete listing.securityLpPayment;
			} else {
				// If funds have already been withdrawn, proceed to create the trading pair.
				listing.tradeTokenPayment.approve(address($.router));

				// Create the trading pair using the router and receive LP tokens.
				(, TokenPayment memory lpPayment) = $.router.createPair(
					listing.tradeTokenPayment
				);

				// Approve the LP tokens for use by the launch pair contract.
				lpPayment.approve(address($.launchPair));

				// Transfer the LP tokens to the launch pair contract.
				$.launchPair.receiveLpToken(lpPayment, listing.campaignId);

				// complete the proposal
				delete $.pairOwnerListing[msg.sender];
			}
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
		MainStorage storage $ = _getMainStorage();
		address user = msg.sender;

		require($.activeListing.endEpoch > currentEpoch(), "Voting complete");

		// Ensure that the trade token is valid and active for voting.
		require(
			isERC20(tradeToken) &&
				$.activeListing.tradeTokenPayment.token == tradeToken,
			"Token not active"
		);

		address userLastVotedToken = $.userVote[user];
		require(
			userLastVotedToken == address(0) ||
				userLastVotedToken == $.activeListing.tradeTokenPayment.token,
			"Please recall previous votes"
		);
		require(
			gTokenPayment.token == address($.gtokens),
			"Governance: Invalid Payment"
		);

		// Calculate the user's vote power based on their gToken attributes.
		GToken.Attributes memory attributes = $
			.gtokens
			.getBalanceAt(user, gTokenPayment.nonce)
			.attributes;
		uint256 epochsLeft = attributes.epochsLeft(
			attributes.epochsElapsed($.epochs.currentEpoch())
		);

		require(
			epochsLeft >= 360,
			"GToken expired, must have at least 360 epochs left to vote with"
		);

		uint256 votePower = attributes.votePower(epochsLeft);

		// Receive the gToken payment and record the user's vote.
		gTokenPayment.receiveToken();
		$.userVotes[user].add(gTokenPayment.nonce);

		// Apply the user's vote to the active listing.
		if (shouldList) {
			$.activeListing.yesVote += votePower;
		} else {
			$.activeListing.noVote += votePower;
		}

		// Update the total LP amount and record the user's vote for the trade token.
		$.activeListing.totalLpAmount += attributes.lpAmount;
		$.userVote[user] = tradeToken;
	}

	/**
	 * @notice Allows users to recall their vote tokens after voting has ended or been canceled.
	 */
	function recallVoteToken() external {
		MainStorage storage $ = _getMainStorage(); // Access the main storage

		address user = msg.sender;
		address tradeToken = $.userVote[user];
		EnumerableSet.UintSet storage userVoteNonces = $.userVotes[user];

		// Ensure the user has votes to recall.
		require(userVoteNonces.length() > 0, "No vote found");

		if (tradeToken != address(0)) {
			if (tradeToken == $.activeListing.tradeTokenPayment.token) {
				GovernanceLib.endVoting($);
			}
		}

		// Recall up to 10 vote tokens at a time.
		uint256 count = 0;
		while (count < 10 && userVoteNonces.length() > 0) {
			count++;

			uint256 nonce = userVoteNonces.at(userVoteNonces.length() - 1);
			userVoteNonces.remove(nonce);
			$.gtokens.safeTransferFrom(
				address(this),
				user,
				nonce,
				GTOKEN_MINT_AMOUNT,
				""
			);
		}

		if (userVoteNonces.length() == 0) {
			delete $.userVote[user]; // Clear the user's vote record.
		}
	}

	function getUserActiveVoteGTokenNonces(
		address voter
	) public view returns (uint256[] memory) {
		MainStorage storage $ = _getMainStorage(); // Access the main storage
		return $.userVotes[voter].values();
	}

	function protocolFees() public view returns (uint256) {
		return _getMainStorage().protocolFees;
	}

	function gtokens() public view returns (GTokens) {
		return _getMainStorage().gtokens;
	}

	function rewardPerShare() public view returns (uint256) {
		return _getMainStorage().rewardPerShare;
	}

	function lpTokenAddress() public view returns (address) {
		return _getMainStorage().lpTokenAddress;
	}

	function rewardsReserve() public view returns (uint256) {
		return _getMainStorage().rewardsReserve;
	}

	function launchPair() public view returns (LaunchPair) {
		return _getMainStorage().launchPair;
	}

	function activeListing()
		public
		view
		returns (Governance.TokenListing memory)
	{
		return _getMainStorage().activeListing;
	}

	function pairOwnerListing(
		address pairOwner
	) public view returns (Governance.TokenListing memory) {
		return _getMainStorage().pairOwnerListing[pairOwner];
	}

	function epochs() public view returns (Epochs.Storage memory) {
		return _getMainStorage().epochs;
	}

	function listing_fees() public pure returns (uint256) {
		return LISTING_FEE;
	}

	receive() external payable {}
}

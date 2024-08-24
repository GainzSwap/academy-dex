// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

import { TokenPayment, TokenPayments } from "../common/libs/TokenPayments.sol";

/**
 * @title Launchpad
 * @dev This contract facilitates the creation and management of crowdfunding campaigns for launching new tokens. Participants contribute funds to campaigns, and if the campaign is successful, they receive launchpad tokens in return. If the campaign fails, their contributions are refunded.
 */
contract Launchpad is Ownable, ReentrancyGuard {
	using TokenPayments for TokenPayment;
	using EnumerableSet for EnumerableSet.UintSet;

	enum CampaignStatus {
		Pending,
		Funding,
		Failed,
		Success
	}

	struct Campaign {
		address payable creator;
		IERC20 launchpadToken;
		uint256 goal;
		uint256 deadline;
		uint256 fundsRaised;
		uint256 maxTokensToDistribute;
		uint256 tokensDistributed;
		bool isWithdrawn;
		CampaignStatus status;
	}

	// Mapping from campaign ID to Campaign struct
	mapping(uint256 => Campaign) public campaigns;

	// Mapping from campaign ID to a participant's address to their contribution amount
	mapping(uint256 => mapping(address => uint256)) public contributions;

	// Mapping from a user's address to the set of campaign IDs they participated in
	mapping(address => EnumerableSet.UintSet) private _userCampaigns;

	// Set of all campaign IDs
	EnumerableSet.UintSet private _allCampaigns;

	// Total number of campaigns created
	uint256 public campaignCount;

	// Event emitted when a new campaign is created
	event CampaignCreated(
		uint256 indexed campaignId,
		address indexed creator,
		uint256 goal,
		uint256 deadline
	);

	// Event emitted when a contribution is made to a campaign
	event ContributionMade(
		uint256 indexed campaignId,
		address indexed contributor,
		uint256 amount
	);

	// Event emitted when tokens are distributed to a participant
	event TokensDistributed(
		uint256 indexed campaignId,
		address indexed contributor,
		uint256 amount
	);

	// Event emitted when the campaign creator withdraws funds after a successful campaign
	event FundsWithdrawn(
		uint256 indexed campaignId,
		address indexed creator,
		uint256 amount
	);

	// Event emitted when a refund is issued to a participant after a failed campaign
	event RefundIssued(
		uint256 indexed campaignId,
		address indexed contributor,
		uint256 amount
	);

	// Modifier to ensure the caller is the creator of the campaign
	modifier onlyCreator(uint256 _campaignId) {
		require(
			msg.sender == campaigns[_campaignId].creator,
			"Not campaign creator"
		);
		_;
	}

	// Modifier to ensure the campaign exists
	modifier campaignExists(uint256 _campaignId) {
		require(
			campaigns[_campaignId].creator != address(0),
			"Campaign does not exist"
		);
		_;
	}

	// Modifier to ensure the campaign has not expired
	modifier isNotExpired(uint256 _campaignId) {
		require(
			block.timestamp <= campaigns[_campaignId].deadline,
			"Campaign expired"
		);
		_;
	}

	// Modifier to ensure the campaign has met its funding goal
	modifier hasMetGoal(uint256 _campaignId) {
		require(
			campaigns[_campaignId].fundsRaised >= campaigns[_campaignId].goal,
			"Goal not met"
		);
		_;
	}

	// Modifier to ensure the campaign funds have not been withdrawn yet
	modifier hasNotWithdrawn(uint256 _campaignId) {
		require(!campaigns[_campaignId].isWithdrawn, "Funds already withdrawn");
		_;
	}

	// Modifier to ensure the caller is a participant in the specified campaign
	modifier isCampaignParticipant(address user, uint256 _campaignId) {
		require(
			_userCampaigns[user].contains(_campaignId),
			"Not a participant of selected campaign"
		);
		_;
	}

	/**
	 * @dev Creates a new crowdfunding campaign.
	 * @param payment Details of the launchpad token payment.
	 * @param _creator The address of the campaign creator.
	 * @return campaignId The ID of the newly created campaign.
	 */
	function createCampaign(
		TokenPayment calldata payment,
		address _creator
	) external onlyOwner returns (uint256 campaignId) {
		require(payment.amount > 0, "Invalid payment");
		payment.receiveToken();

		campaignId = ++campaignCount;
		campaigns[campaignId] = Campaign({
			creator: payable(_creator),
			launchpadToken: IERC20(payment.token),
			goal: 0,
			deadline: 0,
			fundsRaised: 0,
			maxTokensToDistribute: payment.amount,
			tokensDistributed: 0,
			isWithdrawn: false,
			status: CampaignStatus.Pending
		});
	}

	/**
	 * @dev Starts a created campaign.
	 * @param _goal The funding goal for the campaign.
	 * @param _duration The duration of the campaign in seconds.
	 * @param _campaignId The ID of the newly created campaign.
	 */
	function startCampaign(
		uint256 _goal,
		uint256 _duration,
		uint256 _campaignId
	) external onlyCreator(_campaignId) {
		require(_goal > 0 && _duration > 0, "Invalid input");

		Campaign storage campaign = campaigns[_campaignId];
		require(
			campaign.status == CampaignStatus.Pending,
			"Campaign begun already"
		);

		campaign.goal = _goal;
		campaign.deadline = block.timestamp + _duration;
		campaign.status = CampaignStatus.Funding;

		_allCampaigns.add(_campaignId);
		emit CampaignCreated(
			_campaignId,
			msg.sender,
			_goal,
			block.timestamp + _duration
		);
	}

	/**
	 * @dev Contribute to a crowdfunding campaign.
	 * @param _campaignId The ID of the campaign to contribute to.
	 */
	function contribute(
		uint256 _campaignId
	) external payable campaignExists(_campaignId) isNotExpired(_campaignId) {
		require(msg.value > 0, "Contribution must be greater than 0");

		Campaign storage campaign = campaigns[_campaignId];
		require(
			campaign.status == CampaignStatus.Funding,
			"Campaign is not in funding status"
		);

		uint256 weiAmount = msg.value;
		campaign.fundsRaised += weiAmount;
		contributions[_campaignId][msg.sender] += weiAmount;

		// Add the campaign to the user's participated campaigns if this is their first contribution
		if (contributions[_campaignId][msg.sender] == weiAmount) {
			_userCampaigns[msg.sender].add(_campaignId);
		}

		emit ContributionMade(_campaignId, msg.sender, weiAmount);
	}

	/**
	 * @dev Withdraw funds after the campaign successfully meets its goal.
	 * @param _campaignId The ID of the campaign to withdraw funds from.
	 */
	function withdrawFunds(
		uint256 _campaignId
	)
		external
		campaignExists(_campaignId)
		onlyCreator(_campaignId)
		hasMetGoal(_campaignId)
		hasNotWithdrawn(_campaignId)
	{
		Campaign storage campaign = campaigns[_campaignId];
		uint256 amount = campaign.fundsRaised;
		campaign.isWithdrawn = true;
		campaign.status = CampaignStatus.Success;

		// Remove the campaign from the set of all campaigns
		_removeCampaignFromAllCampaigns(_campaignId);

		campaign.creator.transfer(amount);
		emit FundsWithdrawn(_campaignId, msg.sender, amount);
	}

	/**
	 * @dev Withdraw launchpad tokens after a successful campaign.
	 * @param _campaignId The ID of the campaign to withdraw tokens from.
	 */
	function withdrawLaunchpadToken(
		uint256 _campaignId
	)
		external
		campaignExists(_campaignId)
		hasMetGoal(_campaignId)
		isCampaignParticipant(msg.sender, _campaignId)
	{
		Campaign storage campaign = campaigns[_campaignId];
		require(
			campaign.status == CampaignStatus.Success,
			"Campaign is not successful"
		);

		uint256 contribution = contributions[_campaignId][msg.sender];
		uint256 tokensToDistribute = (contribution *
			campaign.maxTokensToDistribute) / campaign.fundsRaised;
		require(
			campaign.tokensDistributed + tokensToDistribute <=
				campaign.maxTokensToDistribute,
			"Exceeds max tokens to distribute"
		);

		campaign.tokensDistributed += tokensToDistribute;
		campaign.launchpadToken.transfer(msg.sender, tokensToDistribute);

		// Remove the campaign from the user's participated campaigns after token withdrawal
		_removeCampaignFromUserCampaigns(msg.sender, _campaignId);

		emit TokensDistributed(_campaignId, msg.sender, tokensToDistribute);
	}

	/**
	 * @dev Request a refund after a failed campaign.
	 * @param _campaignId The ID of the campaign to refund.
	 */
	function getRefunded(
		uint256 _campaignId
	)
		external
		campaignExists(_campaignId)
		isCampaignParticipant(msg.sender, _campaignId)
	{
		Campaign storage campaign = campaigns[_campaignId];
		require(
			block.timestamp > campaign.deadline &&
				campaign.fundsRaised < campaign.goal,
			"Refund not available"
		);

		uint256 amount = contributions[_campaignId][msg.sender];
		require(amount > 0, "No contributions to refund");

		contributions[_campaignId][msg.sender] = 0;
		payable(msg.sender).transfer(amount);

		// Update the status to Failed
		campaign.status = CampaignStatus.Failed;

		// Remove the campaign from the user's participated campaigns after refund
		_removeCampaignFromUserCampaigns(msg.sender, _campaignId);

		emit RefundIssued(_campaignId, msg.sender, amount);
	}

	/**
	 * @dev Get details of a specific campaign.
	 * @param _campaignId The ID of the campaign to get details of.
	 * @return campaign The Campaign struct containing all details of the campaign.
	 */
	function getCampaignDetails(
		uint256 _campaignId
	) external view returns (Campaign memory) {
		return campaigns[_campaignId];
	}

	/**
	 * @dev Get all campaign IDs.
	 * @return campaignIds An array of all campaign IDs.
	 */
	function getAllCampaigns() external view returns (uint256[] memory) {
		return _allCampaigns.values();
	}

	/**
	 * @dev Get campaign IDs that a user has participated in.
	 * @param user The address of the user.
	 * @return campaignIds An array of campaign IDs that the user has participated in.
	 */
	function getUserCampaigns(
		address user
	) external view returns (uint256[] memory) {
		return _userCampaigns[user].values();
	}

	/**
	 * @dev Remove a campaign from the set of all campaigns after it's successful or failed.
	 * @param campaignId The ID of the campaign to remove.
	 */
	function _removeCampaignFromAllCampaigns(uint256 campaignId) internal {
		_allCampaigns.remove(campaignId);
	}

	/**
	 * @dev Remove a campaign from the user's participated campaigns after withdrawal or refund.
	 * @param user The address of the user.
	 * @param campaignId The ID of the campaign to remove.
	 */
	function _removeCampaignFromUserCampaigns(
		address user,
		uint256 campaignId
	) internal {
		_userCampaigns[user].remove(campaignId);
	}
}

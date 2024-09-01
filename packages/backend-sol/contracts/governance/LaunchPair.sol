// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";

import { TokenPayment, TokenPayments } from "../common/libs/TokenPayments.sol";
import { LpToken } from "../modules/LpToken.sol";

/**
 * @title LaunchPair
 * @dev This contract facilitates the creation and management of crowdfunding campaigns for launching new tokens. Participants contribute funds to campaigns, and if the campaign is successful, they receive launchPair tokens in return. If the campaign fails, their contributions are refunded.
 */
contract LaunchPair is Ownable, ERC1155Holder {
	using TokenPayments for TokenPayment;
	using EnumerableSet for EnumerableSet.UintSet;

	enum CampaignStatus {
		Pending,
		Funding,
		Failed,
		Success
	}

	struct Campaign {
		address creator;
		uint256 lpNonce;
		uint256 goal;
		uint256 deadline;
		uint256 fundsRaised;
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
	EnumerableSet.UintSet private _activeCampaigns;

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

	LpToken immutable lpToken;

	constructor(address _lpToken) {
		lpToken = LpToken(_lpToken);
	}

	/**
	 * @dev Creates a new crowdfunding campaign.
	 * @param _creator The address of the campaign creator.
	 * @return campaignId The ID of the newly created campaign.
	 */
	function createCampaign(
		address _creator
	) external onlyOwner returns (uint256 campaignId) {
		campaignId = ++campaignCount;
		campaigns[campaignId] = Campaign({
			creator: payable(_creator),
			goal: 0,
			deadline: 0,
			fundsRaised: 0,
			lpNonce: 0,
			isWithdrawn: false,
			status: CampaignStatus.Pending
		});
	}

	function receiveLpToken(
		TokenPayment calldata payment,
		uint256 _campaignId
	) external onlyOwner campaignExists(_campaignId) hasMetGoal(_campaignId) {
		require(
			payment.amount > 0 &&
				payment.nonce > 0 &&
				address(lpToken) == payment.token,
			"LaunchPair: Invalid LP token received"
		);
		payment.receiveToken();

		Campaign storage campaign = campaigns[_campaignId];
		require(
			campaign.lpNonce == 0,
			"Launchpair: Campaign received lp already"
		);
		campaign.lpNonce = payment.nonce;
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

		_activeCampaigns.add(_campaignId);
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
		onlyOwner
		hasMetGoal(_campaignId)
		hasNotWithdrawn(_campaignId)
		returns (uint256 amount)
	{
		Campaign storage campaign = campaigns[_campaignId];

		amount = campaign.fundsRaised;
		campaign.isWithdrawn = true;
		campaign.status = CampaignStatus.Success;

		// Remove the campaign from the set of all campaigns
		_removeCampaignFromActiveCampaigns(_campaignId);

		payable(owner()).transfer(amount);
		emit FundsWithdrawn(_campaignId, msg.sender, amount);
	}

	/**
	 * @dev Withdraw launchPair tokens after a successful campaign.
	 * @param _campaignId The ID of the campaign to withdraw tokens from.
	 */
	function withdrawLaunchPairToken(
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

		uint256 lpBalance = lpToken
			.getBalanceAt(address(this), campaign.lpNonce)
			.amount;

		uint256 contribution = contributions[_campaignId][msg.sender];
		uint256 lpShare = (contribution * lpBalance) / campaign.fundsRaised;

		address[] memory addresses = new address[](2);
		uint256[] memory portions = new uint256[](2);

		addresses[0] = address(this);
		portions[0] = lpBalance - lpShare;

		addresses[1] = msg.sender;
		portions[1] = lpShare;

		uint256[] memory nonces = lpToken.split(
			campaign.lpNonce,
			addresses,
			portions
		);
		campaign.lpNonce = nonces[0];

		// Remove the campaign from the user's participated campaigns after token withdrawal
		_removeCampaignFromUserCampaigns(msg.sender, _campaignId);

		emit TokensDistributed(_campaignId, msg.sender, lpShare);
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
	function getActiveCampaigns() external view returns (uint256[] memory) {
		return _activeCampaigns.values();
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
	function _removeCampaignFromActiveCampaigns(uint256 campaignId) internal {
		_activeCampaigns.remove(campaignId);
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

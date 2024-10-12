// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import { OwnableUpgradeable } from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import { ERC1155HolderUpgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC1155/utils/ERC1155HolderUpgradeable.sol";

import "../common/libs/Fee.sol";

import "../pair/Pair.sol";
import "../pair/BasePair.sol";

import "./User.sol";

import { LpToken } from "../modules/LpToken.sol";
import { ADEX } from "../ADexToken/ADEX.sol";
import { ADexInfo } from "../ADexToken/AdexInfo.sol";
import { AdexEmission } from "../ADexToken/AdexEmission.sol";
import { Amm } from "../common/Amm.sol";
import { Epochs } from "../common/Epochs.sol";
import { Governance } from "../governance/Governance.sol";
import { DeployGovernance } from "../governance/DeployGovernance.sol";
import { EDUPair, DeployEduPair } from "../pair/EDUPair.sol";

import "../common/libs/Number.sol";
import { IRouter } from "./IRouter.sol";

uint256 constant REWARDS_DIVISION_CONSTANT = 1e18;

import { TransparentUpgradeableProxy } from "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";

library DeployLpToken {
	function newLpToken(
		address initialOwner,
		address proxyAdmin
	) external returns (LpToken) {
		address lpTokenImplementation = address(new LpToken());

		// Deploy the TransparentUpgradeableProxy and initialize the LpToken contract
		TransparentUpgradeableProxy proxy = new TransparentUpgradeableProxy(
			lpTokenImplementation,
			proxyAdmin,
			abi.encodeWithSelector(LpToken.initialize.selector, initialOwner)
		);

		// Return the LpToken instance through the proxy
		return LpToken(address(proxy));
	}
}

contract Router is
	IRouter,
	OwnableUpgradeable,
	UserModule,
	ERC1155HolderUpgradeable
{
	using EnumerableSet for EnumerableSet.AddressSet;
	using Address for address;
	using Epochs for Epochs.Storage;
	using Number for uint256;
	using TokenPayments for TokenPayment;

	struct PairData {
		uint256 sellVolume;
		uint256 buyVolume;
		uint256 lpRewardsPershare;
		uint256 tradeRewardsPershare;
		uint256 totalLiq;
		uint256 rewardsReserve;
	}

	struct GlobalData {
		uint256 rewardsReserve;
		uint256 taxRewards;
		uint256 rewardsPerShare;
		uint256 totalTradeVolume;
		uint256 lastTimestamp;
		uint256 totalLiq;
	}

	/// @custom:storage-location erc7201:router.storage
	struct RouterStorage {
		Epochs.Storage epochs;
		EnumerableSet.AddressSet pairs;
		EnumerableSet.AddressSet tradeTokens;
		address _wEduAddress;
		mapping(address => address) tokensPairAddress;
		mapping(address => PairData) pairsData;
		GlobalData globalData;
		LpToken lpToken;
		Governance governance;
		address adexTokenAddress;
		address proxyAdmin;
		address pairBeacon;
	}

	// keccak256(abi.encode(uint256(keccak256("router.storage")) - 1)) & ~bytes32(uint256(0xff));
	bytes32 private constant ROUTER_STORAGE_LOCATION =
		0x012ef321094c8c682aa635dfdfcd754624a7473f08ad6ac415bb7f35eb12a100;

	function _getRouterStorage()
		private
		pure
		returns (RouterStorage storage $)
	{
		assembly {
			$.slot := ROUTER_STORAGE_LOCATION
		}
	}

	function _getPairData(
		address pair
	) internal view returns (PairData storage) {
		RouterStorage storage $ = _getRouterStorage();
		return $.pairsData[pair];
	}

	function pairsData(address pair) public view returns (PairData memory) {
		return _getPairData(pair);
	}

	function lpToken() public view returns (LpToken) {
		return _getRouterStorage().lpToken;
	}

	function governance() public view returns (Governance) {
		return _getRouterStorage().governance;
	}

	function tokensPairAddress(address pair) public view returns (address) {
		return _getRouterStorage().tokensPairAddress[pair];
	}

	function _getGlobalData() internal view returns (GlobalData storage) {
		RouterStorage storage $ = _getRouterStorage();
		return $.globalData;
	}

	function _getEpochsStorage()
		internal
		view
		returns (Epochs.Storage storage)
	{
		RouterStorage storage $ = _getRouterStorage();
		return $.epochs;
	}

	event LiquidityRemoved(
		address indexed user,
		address indexed pair,
		uint256 liquidityRemoved,
		uint256 tradeTokenAmount,
		uint256 baseTokenAmount
	);

	function initialize(address initialOwner) public initializer {
		__Ownable_init(initialOwner);

		RouterStorage storage $ = _getRouterStorage();

		$.epochs.initialize(24 hours);

		// Access and modify globalData via the storage function
		$.globalData.lastTimestamp = block.timestamp;

		// Set the proxy admin via the storage function
		$.proxyAdmin = msg.sender;

		// Use the DeployLpToken library to deploy and initialize the LpToken
		$.lpToken = DeployLpToken.newLpToken(address(this), $.proxyAdmin);

		$.pairBeacon = DeployPair.deployPairBeacon($.proxyAdmin);
	}

	function getWEDU() public view returns (address) {
		RouterStorage storage $ = _getRouterStorage();

		require(
			$._wEduAddress != address(0),
			"Router: EDUPair not yet deployed"
		);
		return $._wEduAddress;
	}

	function _computeEdgeEmissions(
		uint256 epoch,
		uint256 lastTimestamp,
		uint256 latestTimestamp
	) internal view returns (uint256) {
		RouterStorage storage $ = _getRouterStorage(); // Access namespaced storage

		(uint256 startTimestamp, uint256 endTimestamp) = $
			.epochs
			.epochEdgeTimestamps(epoch);

		uint256 upperBoundTime = 0;
		uint256 lowerBoundTime = 0;

		if (
			startTimestamp <= latestTimestamp && latestTimestamp <= endTimestamp
		) {
			upperBoundTime = latestTimestamp;
			lowerBoundTime = startTimestamp;
		} else if (
			startTimestamp <= lastTimestamp && lastTimestamp <= endTimestamp
		) {
			upperBoundTime = latestTimestamp <= endTimestamp
				? latestTimestamp
				: endTimestamp;
			lowerBoundTime = lastTimestamp;
		} else {
			revert("Router._computeEdgeEmissions: Invalid timestamps");
		}

		return
			AdexEmission.throughTimeRange(
				epoch,
				upperBoundTime - lowerBoundTime,
				$.epochs.epochLength
			);
	}

	function _generateRewards(
		PairData memory data
	)
		internal
		view
		returns (PairData memory newPairData, GlobalData memory newGlobalData)
	{
		newGlobalData = _generateGlobalRewards();
		newPairData = _generatePairReward(data, newGlobalData);
	}

	function _generateGlobalRewards()
		private
		view
		returns (GlobalData memory newGlobalData)
	{
		GlobalData memory globalData = _getGlobalData();
		Epochs.Storage storage epochs = _getEpochsStorage();

		newGlobalData = globalData;

		uint256 currentTimestamp = block.timestamp;
		uint256 lastTimestamp = newGlobalData.lastTimestamp;

		if (
			lastTimestamp < currentTimestamp && globalData.totalTradeVolume > 0
		) {
			uint256 lastGenerateEpoch = epochs.computeEpoch(lastTimestamp);
			uint256 generatedRewards = _computeEdgeEmissions(
				lastGenerateEpoch,
				lastTimestamp,
				currentTimestamp
			);

			uint256 currentEpoch = epochs.currentEpoch();
			if (currentEpoch > lastGenerateEpoch) {
				uint256 intermediateEpochs = currentEpoch -
					lastGenerateEpoch -
					1;

				if (intermediateEpochs > 1) {
					generatedRewards += AdexEmission.throughEpochRange(
						lastGenerateEpoch,
						lastGenerateEpoch + intermediateEpochs
					);
				}

				generatedRewards += _computeEdgeEmissions(
					currentEpoch,
					lastTimestamp,
					currentTimestamp
				);
			}

			// Tax is set at 7.5%, this can be changed by governance
			uint256 taxRewards;
			(generatedRewards, taxRewards) = generatedRewards.take(
				(generatedRewards * 7_5) / 100_0
			);

			uint256 rpsIncrease = (generatedRewards *
				REWARDS_DIVISION_CONSTANT) / globalData.totalTradeVolume;

			newGlobalData.lastTimestamp = currentTimestamp;
			newGlobalData.rewardsPerShare += rpsIncrease;
			newGlobalData.rewardsReserve += generatedRewards;
			newGlobalData.taxRewards += taxRewards;
		}
	}

	function _generatePairReward(
		PairData memory data,
		GlobalData memory globalData_
	) private pure returns (PairData memory newPairData) {
		newPairData = data;
		if (newPairData.tradeRewardsPershare < globalData_.rewardsPerShare) {
			if (newPairData.buyVolume > 0 && newPairData.totalLiq > 0) {
				// compute reward
				uint256 computedReward = ((globalData_.rewardsPerShare -
					newPairData.tradeRewardsPershare) * newPairData.buyVolume) /
					REWARDS_DIVISION_CONSTANT;
				// FIXME computedReward gets higher than globalData_.rewardsReserve when new pair is added after a long time
				// Transfer rewards
				globalData_.rewardsReserve -= computedReward;
				newPairData.rewardsReserve += computedReward;

				uint256 rpsIncrease = (computedReward *
					REWARDS_DIVISION_CONSTANT) / newPairData.totalLiq;
				newPairData.lpRewardsPershare += rpsIncrease;
			}

			newPairData.tradeRewardsPershare = globalData_.rewardsPerShare;
		}
	}

	function _computeRewardsClaimable(
		LpToken.LpBalance memory balance
	)
		internal
		view
		returns (
			uint256 claimable,
			PairData memory pairData,
			GlobalData memory newGlobalData,
			LpToken.LpAttributes memory newAttr
		)
	{
		(pairData, newGlobalData) = _generateRewards(
			_getPairData(balance.attributes.pair)
		);
		(claimable, newAttr) = _computeLpClaimable(pairData, balance);
	}

	function _computeLpClaimable(
		PairData memory pairData,
		LpToken.LpBalance memory balance
	)
		private
		pure
		returns (uint256 claimable, LpToken.LpAttributes memory newAttr)
	{
		newAttr = balance.attributes;

		if (newAttr.rewardPerShare < pairData.lpRewardsPershare) {
			// compute reward
			claimable =
				((pairData.lpRewardsPershare - newAttr.rewardPerShare) *
					balance.amount) /
				REWARDS_DIVISION_CONSTANT;

			pairData.rewardsReserve -= claimable;
			newAttr.rewardPerShare = pairData.lpRewardsPershare;
		}
	}

	function _sendTaxRewards() private {
		RouterStorage storage $ = _getRouterStorage();

		uint256 taxRewards = $.globalData.taxRewards;

		if (taxRewards > 0) {
			$.globalData.taxRewards = 0;

			IERC20($.adexTokenAddress).approve(
				address($.governance),
				taxRewards
			);
			$.governance.receiveRewards(
				TokenPayment({
					token: $.adexTokenAddress,
					nonce: 0,
					amount: taxRewards
				})
			);
		}
	}

	function _updateGlobalData(GlobalData memory newGlobalData) private {
		RouterStorage storage $ = _getRouterStorage();

		$.globalData = newGlobalData;
		_sendTaxRewards();
	}

	function _updatePairData(
		PairData storage pairData,
		PairData memory newPairData
	) private {
		pairData.lpRewardsPershare = newPairData.lpRewardsPershare;
		pairData.rewardsReserve = newPairData.rewardsReserve;
		pairData.tradeRewardsPershare = newPairData.tradeRewardsPershare;
	}

	function _runUpdatesAfterRewardsGenerated(
		PairData storage pairData,
		PairData memory newPairData,
		GlobalData memory newGlobalData
	) internal {
		_updatePairData(pairData, newPairData);
		_updateGlobalData(newGlobalData);
	}

	modifier canCreatePair() {
		RouterStorage storage $ = _getRouterStorage();

		require(
			msg.sender == owner() || msg.sender == address($.governance),
			"Router: Not allowed to list token"
		);
		_;
	}

	function _addInitialLiquidity(
		address pairAddress,
		TokenPayment memory payment
	) private returns (TokenPayment memory lpPayment) {
		RouterStorage storage $ = _getRouterStorage();

		payment.approve(pairAddress);
		lpPayment.nonce = this.addLiquidity(payment);

		lpPayment.token = address($.lpToken);
		lpPayment.amount = $
			.lpToken
			.getBalanceAt(address(this), lpPayment.nonce)
			.amount;

		lpPayment.sendToken(msg.sender);
	}

	function _prepareWEDUReception()
		private
		returns (TokenPayment memory payment)
	{
		payment.token = getWEDU();
		payment.amount = msg.value;

		payment.receiveToken();
	}

	function _receiveEDUForSpend()
		private
		returns (TokenPayment memory payment)
	{
		RouterStorage storage $ = _getRouterStorage();

		payment.token = getWEDU();
		payment.amount = msg.value;

		WEDU(payable(payment.token)).receiveForSpender{ value: msg.value }(
			msg.sender,
			$.tokensPairAddress[payment.token]
		);
	}

	function generateRewards() external {
		RouterStorage storage $ = _getRouterStorage();

		require(msg.sender == address($.governance), "Router: Not allowed");

		_updateGlobalData(_generateGlobalRewards());
	}

	/**
	 * @notice Creates a new pair.
	 * @dev The first pair becomes the base pair -- For now, called by only owner..when DAO is implemented, DAO can call this
	 * @return pairAddress Address of the newly created pair.
	 */
	function createPair(
		TokenPayment memory payment
	)
		external
		payable
		canCreatePair
		returns (address pairAddress, TokenPayment memory lpPayment)
	{
		RouterStorage storage $ = _getRouterStorage();

		address tradeToken = payment.token;

		require(
			$.tokensPairAddress[tradeToken] == address(0),
			"Token already added"
		);

		Pair pair;

		if (pairsCount() == 0) {
			pair = DeployBasePair.newBasePair($.proxyAdmin, address(this));
			tradeToken = pair.tradeToken();
			$.adexTokenAddress = tradeToken;

			IERC20($.adexTokenAddress).transfer(owner(), ADexInfo.ICO_FUNDS);
			$.governance = DeployGovernance.newGovernance(
				address($.lpToken),
				$.adexTokenAddress,
				$.epochs,
				address(this),
				$.proxyAdmin
			);

			payment = TokenPayment({
				token: $.adexTokenAddress,
				nonce: 0,
				amount: ADexInfo.INTIAL_LIQUIDITY
			});
		} else if (msg.value > 0) {
			pair = DeployEduPair.newEDUPair(basePairAddr(), $.proxyAdmin);
			tradeToken = address(pair.tradeToken());
			$._wEduAddress = tradeToken;

			// Prepare native token
			payment = _prepareWEDUReception();
		} else {
			require(
				payment.amount > 0,
				"Router: Invalid initial liquidity amount"
			);
			payment.receiveToken();

			pair = DeployPair.newPair($.pairBeacon, tradeToken, basePairAddr());
		}

		pairAddress = address(pair);

		$.pairs.add(pairAddress);
		$.tradeTokens.add(tradeToken);
		$.tokensPairAddress[tradeToken] = pairAddress;

		lpPayment = _addInitialLiquidity(pairAddress, payment);
	}

	/**
	 * @notice Adds liquidity to a pair.
	 * @param wholePayment Payment details for adding liquidity.
	 */
	function addLiquidity(
		TokenPayment memory wholePayment
	) external payable returns (uint256) {
		RouterStorage storage $ = _getRouterStorage();

		address caller = msg.sender;
		if (msg.value > 0) {
			wholePayment = _receiveEDUForSpend();
		}

		address tokenAddress = address(wholePayment.token);
		address pairAddress = $.tokensPairAddress[tokenAddress];
		require(pairAddress != address(0), "Router: Invalid pair address");
		require(wholePayment.amount > 0, "Router: Invalid liquidity payment");

		PairData storage pairData = $.pairsData[pairAddress];
		(
			PairData memory newPairData,
			GlobalData memory newGlobalData
		) = _generateRewards(pairData);
		_runUpdatesAfterRewardsGenerated(pairData, newPairData, newGlobalData);

		(uint256 liqAdded, uint256 depValuePerShare) = Pair(pairAddress)
			.addLiquidity(wholePayment, caller);

		// Upadte liquidity data to be used for other computations like fee
		$.globalData.totalLiq += liqAdded;

		// Update pairData
		pairData.totalLiq += liqAdded;

		return
			$.lpToken.mint(
				pairData.lpRewardsPershare,
				liqAdded,
				pairAddress,
				tokenAddress,
				caller,
				depValuePerShare
			);
	}

	// function claimRewards(
	// 	uint256[] memory nonces
	// ) external returns (uint256 totalClaimed, uint256[] memory newNonces) {
	// 	RouterStorage storage $ = _getRouterStorage();

	// 	address user = msg.sender;
	// 	newNonces = nonces;

	// 	_updateGlobalData(_generateGlobalRewards());

	// 	// Claim from max of 10 lp tokens at a time
	// 	uint256 totalToClaim = nonces.length < 10 ? nonces.length : 10;
	// 	for (uint256 i = 0; i < totalToClaim; i++) {
	// 		LpToken.LpBalance memory balance = $.lpToken.getBalanceAt(
	// 			user,
	// 			nonces[i]
	// 		);

	// 		PairData storage pairData = $.pairsData[balance.attributes.pair];
	// 		PairData memory newPairData = _generatePairReward(
	// 			pairData,
	// 			$.globalData
	// 		);
	// 		(
	// 			uint256 claimable,
	// 			LpToken.LpAttributes memory newAttr
	// 		) = _computeLpClaimable(newPairData, balance);
	// 		_updatePairData(pairData, newPairData);

	// 		// Claim the rewards if available
	// 		if (claimable > 0) {
	// 			totalClaimed += claimable;

	// 			// Update LP attributes and data
	// 			uint256 newNonce = $.lpToken.update(
	// 				user,
	// 				balance.nonce,
	// 				balance.amount,
	// 				abi.encode(newAttr)
	// 			);
	// 			newNonces[i] = newNonce;
	// 		}
	// 	}

	// 	if (totalClaimed > 0) {
	// 		// Transfer the claimed rewards to the user
	// 		require(
	// 			IERC20($.adexTokenAddress).transfer(user, totalClaimed),
	// 			"Reward transfer failed"
	// 		);
	// 	}
	// }

	/**
	 * @notice Removes liquidity from a pair and claims the corresponding rewards.
	 * @param nonce The SFT nonce representing the LP tokens to burn.
	 * @param liqRemoval The amount of LP tokens to burn.
	 */
	function removeLiquidity(uint256 nonce, uint256 liqRemoval) external {
		RouterStorage storage $ = _getRouterStorage();

		require(liqRemoval > 0, "Router: Amount must be greater than zero");

		// Retrieve the user's LP balance and ensure sufficient balance for removal
		LpToken.LpBalance memory liquidity = $.lpToken.getBalanceAt(
			msg.sender,
			nonce
		);
		require(
			liquidity.amount >= liqRemoval,
			"Router: Insufficient LP balance"
		);

		// Get pair address and corresponding pair data
		address pairAddr = liquidity.attributes.pair;
		PairData storage pairData = $.pairsData[pairAddr];

		// Compute rewards claimable before removing liquidity
		(
			uint256 claimable,
			PairData memory newPairData,
			GlobalData memory newGlobalData,
			LpToken.LpAttributes memory newAttr
		) = _computeRewardsClaimable(liquidity);

		// Update liquidity attributes and pair/global data after computing rewards
		liquidity.attributes = newAttr;
		_runUpdatesAfterRewardsGenerated(pairData, newPairData, newGlobalData);

		// Remove liquidity and get the amount of trade tokens claimed
		Pair pair = Pair(pairAddr);
		uint256 tradeTokenAmount = 0;
		(liquidity, tradeTokenAmount) = pair.removeLiquidity(
			liquidity,
			liqRemoval,
			msg.sender
		);

		// Update LP token balance with the new attributes after liquidity removal
		$.lpToken.update(
			msg.sender,
			liquidity.nonce,
			liquidity.amount,
			abi.encode(liquidity.attributes)
		);

		// Update total liquidity for the pair and globally
		pairData.totalLiq -= liqRemoval;
		$.globalData.totalLiq -= liqRemoval;

		// Transfer rewards if any are claimable
		if (claimable > 0) {
			require(
				IERC20($.adexTokenAddress).transfer(msg.sender, claimable),
				"Reward transfer failed"
			);
		}

		// Emit event for liquidity removal
		emit LiquidityRemoved(
			msg.sender,
			pairAddr,
			liqRemoval,
			tradeTokenAmount,
			claimable
		);
	}

	function getClaimableRewards(
		address user
	) external view returns (uint256 totalClaimable) {
		RouterStorage storage $ = _getRouterStorage();

		LpToken.LpBalance[] memory balances = $.lpToken.lpBalanceOf(user);

		for (uint256 i = 0; i < balances.length; i++) {
			(uint256 claimable, , , ) = _computeRewardsClaimable(balances[i]);
			totalClaimable += claimable;
		}
	}

	function getClaimableRewardsAt(
		address user,
		uint256 nonce
	) external view returns (uint256 claimable) {
		RouterStorage storage $ = _getRouterStorage();
		LpToken.LpBalance memory balance = $.lpToken.getBalanceAt(user, nonce);

		(claimable, , , ) = _computeRewardsClaimable(balance);
	}

	function registerAndSwap(
		uint256 referrerId,
		TokenPayment calldata inPayment,
		address outPairAddr,
		uint256 slippage
	) external payable {
		_createOrGetUserId(msg.sender, referrerId);
		swap(inPayment, outPairAddr, slippage);
	}

	function _executeSwap(
		address swapExecutor,
		TokenPayment memory inPayment,
		address inPairAddr,
		Pair outPair,
		uint256 slippage,
		uint256 tradeVolume
	) private returns (uint256 feeBurnt) {
		(, address referrer) = getReferrer(swapExecutor);

		feeBurnt = Pair(inPairAddr).sell(
			swapExecutor,
			referrer,
			inPayment,
			outPair,
			slippage,
			_computeFeePercent(inPairAddr, tradeVolume)
		);
	}

	/**
	 * @notice Executes a trade between two pairs.
	 * @param outPairAddr Address of the output pair.
	 * @param inPayment Payment details for the trade.
	 * @param slippage Maximum slippage allowed.
	 */
	function swap(
		TokenPayment memory inPayment,
		address outPairAddr,
		uint256 slippage // FIXME I think we can compute the min optimal amount out off chain and pass the calue here, this could save some gas
	) public payable {
		RouterStorage storage $ = _getRouterStorage();

		if (msg.value > 0) {
			inPayment = _receiveEDUForSpend();
		}
		address inPairAddr = $.tokensPairAddress[address(inPayment.token)];

		require($.pairs.contains(inPairAddr), "Router: Input pair not found");
		require($.pairs.contains(outPairAddr), "Router: Output pair not found");

		_updateGlobalData(_generateGlobalRewards());
		_updatePairData(
			$.pairsData[outPairAddr],
			_generatePairReward($.pairsData[outPairAddr], $.globalData)
		);

		Pair outPair = Pair(outPairAddr);
		Pair inPair = Pair(inPairAddr);

		address basePairAddr_ = basePairAddr();
		Pair basePair = Pair(basePairAddr_);

		uint256 outPairReserve = outPair.reserve();
		uint256 basePairReserve = basePair.reserve();

		uint256 tradeVolume = Amm.quote(
			inPayment.amount,
			inPair.reserve(),
			basePairReserve
		);

		{
			uint256 feeBurnt = _executeSwap(
				msg.sender,
				inPayment,
				inPairAddr,
				outPair,
				slippage,
				tradeVolume
			);
			uint256 feeCollected = Amm.quote(
				feeBurnt,
				outPairReserve,
				basePairReserve
			);
			tradeVolume -= feeCollected;

			// Update reward computation data
			$.pairsData[inPairAddr].sellVolume += tradeVolume;
			$.pairsData[outPairAddr].buyVolume += tradeVolume;
			$.pairsData[basePairAddr_].buyVolume += feeCollected;
			$.globalData.totalTradeVolume += tradeVolume + feeCollected;
		}
	}

	/**
	 * @notice Computes the feePercent based on the pair's sales against the liquidity provided in other pairs.
	 * @dev The more a pair is sold, the higher the feePercent. This is computed based on the pair's sales relative to the provided liquidity in other pairs.
	 * @param pairAddress The address of the pair for which the feePercent is being computed.
	 * @param tradeVolume The value in ADEX to be exchanged.
	 * @return feePercent The computed feePercent based on the input amount and the pair's sales.
	 */
	function _computeFeePercent(
		address pairAddress,
		uint256 tradeVolume
	) internal view returns (uint256 feePercent) {
		RouterStorage storage $ = _getRouterStorage();
		PairData memory data = $.pairsData[pairAddress];
		uint256 projectedSales = data.sellVolume + tradeVolume;
		uint256 pairBuys = data.buyVolume;

		uint256 salesDiff = projectedSales > pairBuys
			? projectedSales - pairBuys
			: 0;

		uint256 otherLiq = $.globalData.totalLiq - data.totalLiq;
		feePercent = FeeUtil.feePercent(salesDiff, otherLiq, pairsCount());
	}

	/**
	 * @notice Computes the feePercent based on the pair's sales against the liquidity provided in other pairs.
	 * @dev The more a pair is sold, the higher the feePercent. This is computed based on the pair's sales relative to the provided liquidity in other pairs.
	 * @param pairAddress The address of the pair for which the feePercent is being computed.
	 * @param inAmount The input amount for which the feePercent is being computed.
	 * @return feePercent The computed feePercent based on the input amount and the pair's sales.
	 */
	function computeFeePercent(
		address pairAddress,
		uint256 inAmount
	) public view returns (uint256 feePercent) {
		uint256 tradeVolume = Amm.quote(
			inAmount,
			Pair(pairAddress).reserve(),
			Pair(basePairAddr()).reserve()
		);

		feePercent = _computeFeePercent(pairAddress, tradeVolume);
	}

	/**
	 * @notice Returns the list of all pairs.
	 * @return Array of pair addresses.
	 */
	function getAllPairs() public view returns (address[] memory) {
		RouterStorage storage $ = _getRouterStorage();
		return $.pairs.values();
	}

	/**
	 * @notice Returns the list of all trade token addreses.
	 * @return Array of pair addresses.
	 */
	function tradeableTokens() public view returns (address[] memory) {
		RouterStorage storage $ = _getRouterStorage();
		return $.tradeTokens.values();
	}

	function tokenIsListed(address tokenAddress) public view returns (bool) {
		require(
			tokenAddress != address(0),
			"Router: Invalid trade token address"
		);
		RouterStorage storage $ = _getRouterStorage();
		return $.tradeTokens.contains(tokenAddress);
	}

	/**
	 * @return Returns the basePair address.
	 */
	function basePairAddr() public view returns (address) {
		RouterStorage storage $ = _getRouterStorage();
		return $.pairs.at(0);
	}

	/**
	 * @return count the total count of listed pairs.
	 */
	function pairsCount() public view returns (uint64) {
		RouterStorage storage $ = _getRouterStorage();
		return uint64($.pairs.length());
	}

	/**
	 * @notice Estimates the amount of output tokens to receive for a given input amount, considering slippage.
	 * @dev The function calculates the amount of output tokens after applying the dynamic fee and slippage.
	 * @param inPair The address of the input pair.
	 * @param outPair The address of the output pair.
	 * @param inAmount The amount of input tokens.
	 * @param slippage The maximum allowable slippage percentage (e.g., 50 for 0.5%).
	 * @return amountOut The estimated amount of output tokens.
	 */
	function estimateOutAmount(
		address inPair,
		address outPair,
		uint256 inAmount,
		uint256 slippage
	) public view returns (uint256 amountOut) {
		RouterStorage storage $ = _getRouterStorage();

		require($.pairs.contains(inPair), "Router: Input pair not found");
		require($.pairs.contains(outPair), "Router: Output pair not found");

		Pair inputPair = Pair(inPair);
		Pair outputPair = Pair(outPair);

		uint256 inPairReserve = inputPair.reserve();
		uint256 outPairReserve = outputPair.reserve();

		uint256 feePercent = computeFeePercent(inPair, inAmount);

		uint256 adjustedInAmount = Slippage.compute(inAmount, slippage);

		amountOut = Amm.getAmountOut(
			adjustedInAmount,
			inPairReserve,
			outPairReserve
		);

		amountOut -= (amountOut * feePercent) / FeeUtil.MAX_PERCENT;
	}

	/**
	 * @notice Computes claimable rewards for a list of nonces.
	 * @param nonces Array of nonces to compute claimable rewards for.
	 * @return totalClaimable Total claimable rewards for all provided nonces.
	 */
	function getClaimableRewardsByNonces(
		uint256[] calldata nonces
	) external view returns (uint256 totalClaimable) {
		RouterStorage storage $ = _getRouterStorage();

		for (uint256 i = 0; i < nonces.length; i++) {
			LpToken.LpBalance memory balance = $.lpToken.getBalanceAt(
				msg.sender,
				nonces[i]
			);

			(uint256 claimable, , , ) = _computeRewardsClaimable(balance);

			totalClaimable += claimable;
		}
	}

	function getPairBeacon() public view returns (address) {
		return _getRouterStorage().pairBeacon;
	}

	function eduPairAddr() public view returns (address) {
		RouterStorage storage $ = _getRouterStorage();
		return $.pairs.at(1);
	}

	function viewCurrentEpoch() external view returns (uint256) {
		return _getEpochsStorage().currentEpoch();
	}
}

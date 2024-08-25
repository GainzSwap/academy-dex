// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";

import "../common/libs/Fee.sol";

import "../pair/Pair.sol";
import "../pair/BasePair.sol";

import "../test-case/TestingBasePair.sol";
import "./User.sol";

import { LpToken } from "../modules/LpToken.sol";
import { ADEX } from "../ADexToken/ADEX.sol";
import { ADexInfo } from "../ADexToken/AdexInfo.sol";
import { AdexEmission } from "../ADexToken/AdexEmission.sol";
import { Amm } from "../common/Amm.sol";
import { Epochs } from "../common/Epochs.sol";
import { Governance } from "../governance/Governance.sol";
import { DeployGovernance } from "../governance/DeployGovernance.sol";
import { NativePair } from "../pair/NativePair.sol";

import "../common/libs/Number.sol";
import { IRouter } from "./IRouter.sol";

library PairFactory {
	function newPair(
		address tradeToken,
		address basePairAddr
	) external returns (Pair) {
		return new Pair(tradeToken, basePairAddr);
	}

	function newBasePair() external returns (BasePair) {
		ADEX adex = new ADEX();
		return new BasePair(address(adex));
	}

	// function newNativePair(address basePairAddr) external returns (NativePair) {
	// 	return new NativePair(basePairAddr);
	// }
}

uint256 constant REWARDS_DIVISION_CONSTANT = 1e18;

contract Router is IRouter, Ownable, UserModule, ERC1155Holder {
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

	Epochs.Storage private epochs;

	EnumerableSet.AddressSet private pairs;
	EnumerableSet.AddressSet private tradeTokens;

	mapping(address => address) public tokensPairAddress;
	mapping(address => PairData) public pairsData;
	GlobalData public globalData;

	LpToken public immutable lpToken;
	Governance public governance;
	address private adexTokenAddress;

	event LiquidityRemoved(
		address indexed user,
		address indexed pair,
		uint256 liquidityRemoved,
		uint256 tradeTokenAmount,
		uint256 baseTokenAmount
	);

	constructor() {
		epochs.initialize(24 hours);

		lpToken = new LpToken();

		globalData.lastTimestamp = block.timestamp;
	}

	function _computeEdgeEmissions(
		uint256 epoch,
		uint256 lastTimestamp,
		uint256 latestTimestamp
	) internal view returns (uint256) {
		(uint256 startTimestamp, uint256 endTimestamp) = epochs
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
				epochs.epochLength
			);
	}

	function _generateRewards(
		PairData memory data
	)
		internal
		view
		returns (PairData memory newPairData, GlobalData memory newGlobalData)
	{
		newPairData = data;
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

		if (newPairData.tradeRewardsPershare < newGlobalData.rewardsPerShare) {
			if (newPairData.buyVolume > 0) {
				// compute reward
				uint256 computedReward = ((newGlobalData.rewardsPerShare -
					newPairData.tradeRewardsPershare) * newPairData.buyVolume) /
					REWARDS_DIVISION_CONSTANT;

				// Transfer rewards
				newGlobalData.rewardsReserve -= computedReward;
				newPairData.rewardsReserve += computedReward;

				if (newPairData.totalLiq > 0) {
					uint256 rpsIncrease = (computedReward *
						REWARDS_DIVISION_CONSTANT) / newPairData.totalLiq;

					newPairData.lpRewardsPershare += rpsIncrease;
				}
			}

			newPairData.tradeRewardsPershare = newGlobalData.rewardsPerShare;
		}
	}

	function _computeRewardsClaimable(
		LpToken.LpBalance memory balance
	)
		internal
		view
		returns (
			uint256 claimable,
			PairData memory newPairData,
			GlobalData memory newGlobalData,
			LpToken.LpAttributes memory newAttr
		)
	{
		newAttr = balance.attributes;

		newPairData = pairsData[newAttr.pair];
		(newPairData, newGlobalData) = _generateRewards(newPairData);

		if (newAttr.rewardPerShare < newPairData.lpRewardsPershare) {
			// compute reward
			claimable =
				((newPairData.lpRewardsPershare - newAttr.rewardPerShare) *
					balance.amount) /
				REWARDS_DIVISION_CONSTANT;

			newPairData.rewardsReserve -= claimable;
			newAttr.rewardPerShare = newPairData.lpRewardsPershare;
		}
	}

	function _runUpdatesAfterRewardsGenerated(
		PairData storage pairData,
		PairData memory newPairData,
		GlobalData memory newGlobalData
	) internal {
		pairData.lpRewardsPershare = newPairData.lpRewardsPershare;
		pairData.rewardsReserve = newPairData.rewardsReserve;
		pairData.tradeRewardsPershare = newPairData.tradeRewardsPershare;

		globalData = newGlobalData;

		uint256 taxRewards = globalData.taxRewards;

		if (taxRewards > 0) {
			globalData.taxRewards = 0;

			IERC20(adexTokenAddress).approve(address(governance), taxRewards);
			governance.receiveRewards(
				TokenPayment({
					token: adexTokenAddress,
					nonce: 0,
					amount: taxRewards
				})
			);
		}
	}

	modifier canCreatePair() {
		require(
			msg.sender == owner() || msg.sender == address(governance),
			"Router: Not allowed to list token"
		);
		_;
	}

	function _addInitialLiquidity(
		address pairAddress,
		TokenPayment memory payment
	) private returns (TokenPayment memory lpPayment) {
		payment.approve(pairAddress);
		lpPayment.nonce = this.addLiquidity(payment);

		lpPayment.token = address(lpToken);
		lpPayment.amount = lpToken
			.getBalanceAt(address(this), lpPayment.nonce)
			.amount;

		lpPayment.sendToken(msg.sender);
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
		canCreatePair
		returns (address pairAddress, TokenPayment memory lpPayment)
	{
		address tradeToken = payment.token;

		require(
			tokensPairAddress[tradeToken] == address(0),
			"Token already added"
		);

		Pair pair;

		if (pairsCount() == 0) {
			pair = PairFactory.newBasePair();
			ERC20 adex = pair.tradeToken();
			tradeToken = address(adex);
			adexTokenAddress = tradeToken;

			adex.transfer(owner(), ADexInfo.ICO_FUNDS);
			governance = DeployGovernance.newGovernance(
				address(lpToken),
				tradeToken,
				epochs
			);

			payment = TokenPayment({
				token: adexTokenAddress,
				nonce: 0,
				amount: ADexInfo.INTIAL_LIQUIDITY
			});
		} else {
			require(
				payment.amount > 0,
				"Router: Invalid initial liquidity amount"
			);
			payment.receiveToken();

			pair = PairFactory.newPair(tradeToken, basePairAddr());
		}

		pairAddress = address(pair);

		pairs.add(pairAddress);
		tradeTokens.add(tradeToken);
		tokensPairAddress[tradeToken] = pairAddress;

		payment.approve(pairAddress);
		lpPayment = _addInitialLiquidity(pairAddress, payment);
	}

	/**
	 * @notice Adds liquidity to a pair.
	 * @param wholePayment Payment details for adding liquidity.
	 */
	function addLiquidity(
		TokenPayment memory wholePayment
	) external returns (uint256) {
		address caller = msg.sender;

		address tokenAddress = address(wholePayment.token);
		address pairAddress = tokensPairAddress[tokenAddress];
		require(pairAddress != address(0), "Router: Invalid pair address");
		require(wholePayment.amount > 0, "Router: Invalid liquidity payment");

		(uint256 liqAdded, uint256 depValuePerShare) = Pair(pairAddress)
			.addLiquidity(wholePayment, caller);

		// Upadte liquidity data to be used for other computations like fee
		globalData.totalLiq += liqAdded;

		PairData storage pairData = pairsData[pairAddress];

		// Update pairData
		(
			PairData memory newPairData,
			GlobalData memory newGlobalData
		) = _generateRewards(pairData);
		_runUpdatesAfterRewardsGenerated(pairData, newPairData, newGlobalData);
		pairData.totalLiq += liqAdded;

		return
			lpToken.mint(
				pairData.lpRewardsPershare,
				liqAdded,
				pairAddress,
				tokenAddress,
				caller,
				depValuePerShare
			);
	}

	/**
	 * @notice Claims rewards for a user across all pairs in which they hold LP tokens.
	 * @param nonces The desired SFTs to claim from.
	 */
	function claimRewards(
		uint256[] memory nonces
	) external returns (uint256 totalClaimed, uint256[] memory newNonces) {
		address user = msg.sender;
		newNonces = nonces;

		// Loop through all nonces to calculate and claim rewards
		for (uint256 i = 0; i < nonces.length; i++) {
			LpToken.LpBalance memory balance = lpToken.getBalanceAt(
				user,
				nonces[i]
			);

			(
				uint256 claimable,
				PairData memory newPairData,
				GlobalData memory newGlobalData,
				LpToken.LpAttributes memory newAttr
			) = _computeRewardsClaimable(balance);

			// Claim the rewards if available
			if (claimable > 0) {
				totalClaimed += claimable;

				// Update LP attributes and data
				uint256 newNonce = lpToken.update(
					user,
					balance.nonce,
					balance.amount,
					abi.encode(newAttr)
				);
				newNonces[i] = newNonce;

				PairData storage pairData = pairsData[newAttr.pair];
				_runUpdatesAfterRewardsGenerated(
					pairData,
					newPairData,
					newGlobalData
				);
			}
		}

		require(totalClaimed > 0, "No rewards available to claim");

		// Transfer the claimed rewards to the user
		ERC20 adex = Pair(basePairAddr()).tradeToken();
		require(adex.transfer(user, totalClaimed), "Reward transfer failed");
	}

	/**
	 * @notice Removes liquidity from a pair and claims the corresponding rewards.
	 * @param nonce The SFT nonce representing the LP tokens to burn.
	 * @param liqRemoval The amount of LP tokens to burn.
	 */
	function removeLiquidity(uint256 nonce, uint256 liqRemoval) external {
		require(liqRemoval > 0, "Router: Amount must be greater than zero");

		// Retrieve the user's LP balance and ensure sufficient balance for removal
		LpToken.LpBalance memory liquidity = lpToken.getBalanceAt(
			msg.sender,
			nonce
		);
		require(
			liquidity.amount >= liqRemoval,
			"Router: Insufficient LP balance"
		);

		// Get pair address and corresponding pair data
		address pairAddr = liquidity.attributes.pair;
		PairData storage pairData = pairsData[pairAddr];

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
		lpToken.update(
			msg.sender,
			liquidity.nonce,
			liquidity.amount,
			abi.encode(liquidity.attributes)
		);

		// Update total liquidity for the pair and globally
		pairData.totalLiq -= liqRemoval;
		globalData.totalLiq -= liqRemoval;

		// Transfer rewards if any are claimable
		if (claimable > 0) {
			ERC20 tradeToken = Pair(basePairAddr()).tradeToken();
			require(
				tradeToken.transfer(msg.sender, claimable),
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
		LpToken.LpBalance[] memory balances = lpToken.lpBalanceOf(user);

		for (uint256 i = 0; i < balances.length; i++) {
			(uint256 claimable, , , ) = _computeRewardsClaimable(balances[i]);
			totalClaimable += claimable;
		}
	}

	function getClaimableRewardsAt(
		address user,
		uint256 nonce
	) external view returns (uint256 claimable) {
		LpToken.LpBalance memory balance = lpToken.getBalanceAt(user, nonce);

		(claimable, , , ) = _computeRewardsClaimable(balance);
	}


	function registerAndSwap(
		uint256 referrerId,
		TokenPayment calldata inPayment,
		address outPairAddr,
		uint256 slippage
	) public {
		_createOrGetUserId(msg.sender, referrerId);
		swap(inPayment, outPairAddr, slippage);
	}

	/**
	 * @notice Executes a trade between two pairs.
	 * @param outPairAddr Address of the output pair.
	 * @param inPayment Payment details for the trade.
	 * @param slippage Maximum slippage allowed.
	 */
	function swap(
		TokenPayment calldata inPayment,
		address outPairAddr,
		uint256 slippage
	) public {
		address inPairAddr = tokensPairAddress[address(inPayment.token)];

		require(pairs.contains(inPairAddr), "Router: Input pair not found");
		require(pairs.contains(outPairAddr), "Router: Output pair not found");

		Pair outPair = Pair(outPairAddr);
		Pair inPair = Pair(inPairAddr);

		address basePairAddr_ = basePairAddr();
		Pair basePair = Pair(basePairAddr_);

		uint256 tradeVolume = Amm.quote(
			inPayment.amount,
			inPair.reserve(),
			basePair.reserve()
		);

		(, address referrer) = getReferrer(msg.sender);

		uint256 feeBurnt = Pair(inPairAddr).sell(
			msg.sender,
			referrer,
			inPayment,
			outPair,
			slippage,
			_computeFeePercent(inPairAddr, tradeVolume)
		);

		{
			// Update reward computation data
			pairsData[inPairAddr].sellVolume += tradeVolume;
			pairsData[outPairAddr].buyVolume += tradeVolume;

			uint256 feeCollected = Amm.quote(
				feeBurnt,
				outPair.reserve(),
				basePair.reserve()
			);
			pairsData[basePairAddr_].buyVolume += feeCollected;
			globalData.totalTradeVolume += tradeVolume + feeCollected;
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
		PairData memory data = pairsData[pairAddress];
		uint256 projectedSales = data.sellVolume + tradeVolume;
		uint256 pairBuys = data.buyVolume;

		uint256 salesDiff = projectedSales > pairBuys
			? projectedSales - pairBuys
			: 0;

		uint256 otherLiq = globalData.totalLiq - data.totalLiq;
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
		return pairs.values();
	}

	/**
	 * @notice Returns the list of all trade token addreses.
	 * @return Array of pair addresses.
	 */
	function tradeableTokens() public view returns (address[] memory) {
		return tradeTokens.values();
	}

	function tokenIsListed(address tokenAddress) public view returns (bool) {
		require(
			tokenAddress != address(0),
			"Router: Invalid trade token address"
		);
		return tradeTokens.contains(tokenAddress);
	}

	/**
	 * @return Returns the basePair address.
	 */
	function basePairAddr() public view returns (address) {
		return pairs.at(0);
	}

	/**
	 * @return count the total count of listed pairs.
	 */
	function pairsCount() public view returns (uint64) {
		return uint64(pairs.length());
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
		// Ensure the input and output pairs are registered in the Router
		require(pairs.contains(inPair), "Router: Input pair not found");
		require(pairs.contains(outPair), "Router: Output pair not found");

		// Instantiate Pair contracts for input and output pairs
		Pair inputPair = Pair(inPair);
		Pair outputPair = Pair(outPair);

		// Get reserves for input and output pairs from their respective reserve methods
		uint256 inPairReserve = inputPair.reserve();
		uint256 outPairReserve = outputPair.reserve();

		// Calculate the fee using the Router's computeFeePercent method
		uint256 feePercent = computeFeePercent(inPair, inAmount);

		// Adjust input amount for slippage
		uint256 adjustedInAmount = Slippage.compute(inAmount, slippage);

		// Calculate the output amount using the AMM formula, accounting for the computed fee and slippage
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
		for (uint256 i = 0; i < nonces.length; i++) {
			LpToken.LpBalance memory balance = lpToken.getBalanceAt(
				msg.sender,
				nonces[i]
			);

			(uint256 claimable, , , ) = _computeRewardsClaimable(balance);

			totalClaimable += claimable;
		}
	}
}

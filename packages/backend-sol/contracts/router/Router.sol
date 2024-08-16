// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

import "../common/libs/Fee.sol";

import "../pair/Pair.sol";
import "../pair/BasePair.sol";

import "../test-case/TestingBasePair.sol";
import "./User.sol";

import { LpToken } from "../modules/LpToken.sol";
import { ADEX } from "../ADexToken/ADEX.sol";
import { ADexInfo } from "../ADexToken/AdexInfo.sol";

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
}

contract Router is Ownable, UserModule {
	using EnumerableSet for EnumerableSet.AddressSet;
	using Address for address;

	struct PairData {
		uint256 rewardsAgainst;
		uint256 rewardsFor;
		uint256 totalLiq;
	}

	EnumerableSet.AddressSet private pairs;
	EnumerableSet.AddressSet private tradeTokens;

	mapping(address => address) public tokensPairAddress;
	mapping(address => PairData) public pairData;

	uint256 totalLiq;
	uint256 totalRewards;

	LpToken public immutable lpToken;

	constructor() {
		lpToken = new LpToken();
	}

	/**
	 * @notice Creates a new pair.
	 * @dev The first pair becomes the base pair -- For now, called by only owner..when DAO is implemented, DAO can call this
	 * @param tradeToken Address of the trade token for the pair.
	 * @return pair Address of the newly created pair.
	 */
	function createPair(
		address tradeToken
	) external onlyOwner returns (Pair pair) {
		require(
			tokensPairAddress[tradeToken] == address(0),
			"Token already added"
		);

		if (pairsCount() == 0) {
			pair = PairFactory.newBasePair();
			ERC20 adex = pair.tradeToken();
			tradeToken = address(adex);

			adex.transfer(address(pair), ADexInfo.ECOSYSTEM_DISTRIBUTION_FUNDS);
			adex.transfer(owner(), ADexInfo.ICO_FUNDS);
		} else {
			pair = PairFactory.newPair(tradeToken, basePairAddr());
		}

		pairs.add(address(pair));
		tradeTokens.add(tradeToken);
		tokensPairAddress[tradeToken] = address(pair);
	}

	/**
	 * @notice Adds liquidity to a pair.
	 * @param wholePayment Payment details for adding liquidity.
	 */
	function addLiquidity(ERC20TokenPayment calldata wholePayment) external {
		address caller = msg.sender;

		address tokenAddress = address(wholePayment.token);
		address pairAddress = tokensPairAddress[tokenAddress];
		require(pairAddress != address(0), "Router: Invalid pair address");

		(uint256 liqAdded, uint256 rewardPerShare) = Pair(pairAddress)
			.addLiquidity(wholePayment, caller);

		// Upadte liquidity data to be used for other computations like fee
		totalLiq += liqAdded;
		pairData[tokenAddress].totalLiq += liqAdded;

		lpToken.mint(rewardPerShare, liqAdded, pairAddress, caller);
	}

	/**
	 * @dev Becareful with parameter ordering for `ERC20TokenPayment`
	 */
	function registerAndSwap(
		uint256 referrerId,
		ERC20TokenPayment calldata inPayment,
		address outPairAddr,
		uint256 slippage
	) public {
		_createOrGetUserId(msg.sender, referrerId);
		swap(inPayment, outPairAddr, slippage);

		// TODO learn how to do this properly i.e delegating calls with complex in put parameters
		// (bool success, ) = address(this).delegatecall(
		// 	abi.encodeWithSignature(
		// 		"swap(address,uint256,address,uint256)",
		// 		address(inPayment.token),
		// 		inPayment.amount,
		// 		outPairAddr,
		// 		slippage
		// 	)
		// );
		// require(success, "Router: Delegate call not succeded");
	}

	/**
	 * @notice Executes a trade between two pairs.
	 * @param outPairAddr Address of the output pair.
	 * @param inPayment Payment details for the trade.
	 * @param slippage Maximum slippage allowed.
	 */
	function swap(
		ERC20TokenPayment calldata inPayment,
		address outPairAddr,
		uint256 slippage
	) public {
		address inPairAddr = tokensPairAddress[address(inPayment.token)];

		require(pairs.contains(inPairAddr), "Router: Input pair not found");
		require(pairs.contains(outPairAddr), "Router: Output pair not found");

		Pair outPair = Pair(outPairAddr);
		uint256 initialOutPairRewards = outPair.rewards();

		(, address referrer) = getReferrer(msg.sender);
		Pair(inPairAddr).sell(
			msg.sender,
			referrer,
			inPayment,
			outPair,
			slippage,
			computeFeePercent(inPairAddr, inPayment.amount)
		);

		uint256 finalOutPairRewards = outPair.rewards();

		uint256 rewardsChange = finalOutPairRewards - initialOutPairRewards;
		require(rewardsChange > 0, "Router: no rewards gianed for out pair");

		pairData[inPairAddr].rewardsAgainst += rewardsChange;
		pairData[outPairAddr].rewardsFor += rewardsChange;
		totalRewards += rewardsChange;
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
		uint256 projectedRewardsChange = Amm.quote(
			inAmount,
			Pair(pairAddress).reserve(),
			Pair(basePairAddr()).reserve()
		);

		uint256 pairSales = pairData[pairAddress].rewardsAgainst +
			projectedRewardsChange;
		uint256 pairBuys = pairData[pairAddress].rewardsFor;

		uint256 salesDiff = pairSales > pairBuys ? pairSales - pairBuys : 0;

		uint256 otherLiq = totalLiq - pairData[pairAddress].totalLiq;
		feePercent = FeeUtil.feePercent(salesDiff, otherLiq, pairsCount());
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
}

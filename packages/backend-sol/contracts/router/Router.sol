// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity 0.8.26;

import "@openzeppelin/contracts/access/Ownable.sol";

import "../pair/Pair.sol";
import "../pair/BasePair.sol";
import "../common/libs/Fee.sol";

contract Router is Ownable {
	struct PairData {
		uint256 rewardsAgainst;
		uint256 rewardsFor;
		uint256 totalLiq;
	}

	address public basePairAddr;

	mapping(address => address) public tokensPairAddress;
	mapping(address => PairData) public pairData;
	uint64 pairsCount;

	uint256 totalLiq;
	uint256 totalRewards;

	// This function is created here so that we can create a testing version
	// of Router
	function _newBasePair() internal virtual returns (BasePair) {
		return new BasePair();
	}

	// For now, called by only owner..when DAO is implemented, DAO can call this
	// The first pair becomes the base pair
	function createPair(
		address tradeToken
	) external onlyOwner returns (Pair pair) {
		require(
			tokensPairAddress[tradeToken] == address(0),
			"Token already added"
		);

		if (basePairAddr == address(0)) {
			pair = _newBasePair();
			basePairAddr = address(pair);
			tradeToken = address(pair.tradeToken());
		} else {
			pair = new Pair(tradeToken, basePairAddr);
		}

		tokensPairAddress[tradeToken] = address(pair);
		pairsCount++;
	}

	function addLiquidity(ERC20TokenPayment calldata wholePayment) external {
		address tokenAddress = address(wholePayment.token);
		Pair pair = Pair(tokensPairAddress[tokenAddress]);

		uint256 liqAdded = pair.addLiquidity(wholePayment, msg.sender);

		totalLiq += liqAdded;
		pairData[tokenAddress].totalLiq += liqAdded;
	}

	function swap(
		ERC20TokenPayment calldata inPayment,
		Pair inPair,
		Pair outPair,
		uint256 slippage
	) external {
		uint256 initialOutPairRewards = outPair.rewards();

		inPair.sell(
			msg.sender,
			inPayment,
			outPair,
			slippage,
			computeFee(address(inPair), inPayment.amount)
		);

		uint256 finalOutPairRewards = outPair.rewards();

		uint256 rewardsChange = finalOutPairRewards - initialOutPairRewards;
		require(rewardsChange > 0, "Router: no rewards gianed for out pair");

		pairData[address(inPair)].rewardsAgainst += rewardsChange;
		pairData[address(outPair)].rewardsFor += rewardsChange;
		totalRewards += rewardsChange;
	}

	// The more a pair is sold, the more the fee
	// This computes the fee based on the pair's sales against the
	// liquidity provided in other pairs
	function computeFee(
		address pairAddress,
		uint256 inAmount
	) public view returns (uint256 fee) {
		uint256 projectedRewardsChange = Amm.quote(
			inAmount,
			Pair(pairAddress).reserve(),
			Pair(basePairAddr).reserve()
		);

		uint256 pairSales = pairData[pairAddress].rewardsAgainst +
			projectedRewardsChange;
		uint256 pairBuys = pairData[pairAddress].rewardsFor;

		uint256 salesDiff = pairSales > pairBuys ? pairSales - pairBuys : 0;

		uint256 otherLiq = totalLiq - pairData[pairAddress].totalLiq;
		fee = FeeUtil.feePercent(salesDiff, otherLiq, pairsCount);
	}
}

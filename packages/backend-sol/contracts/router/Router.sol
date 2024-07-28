// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

import "../common/libs/Fee.sol";

import "../pair/Pair.sol";
import "../pair/BasePair.sol";

contract Router is Ownable {
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

	// This function is created here so that we can create a testing version
	// of Router
	function _newBasePair() internal virtual returns (BasePair) {
		return new BasePair();
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
			pair = _newBasePair();
			tradeToken = address(pair.tradeToken());
		} else {
			pair = new Pair(tradeToken, basePairAddr());
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
		address tokenAddress = address(wholePayment.token);
		address pairAddress = tokensPairAddress[tokenAddress];
		require(pairAddress != address(0), "Router: Invalid pair address");

		uint256 liqAdded = Pair(pairAddress).addLiquidity(
			wholePayment,
			msg.sender
		);

		// Upadte liquidity data to be used for other computations like fee
		totalLiq += liqAdded;
		pairData[tokenAddress].totalLiq += liqAdded;
	}

	/**
	 * @notice Executes a trade between two pairs.
	 * @param inPair Address of the input pair.
	 * @param outPair Address of the output pair.
	 * @param inPayment Payment details for the trade.
	 * @param slippage Maximum slippage allowed.
	 */
	function swap(
		ERC20TokenPayment calldata inPayment,
		Pair inPair,
		Pair outPair,
		uint256 slippage
	) external {
		require(
			pairs.contains(address(inPair)),
			"Router: Input pair not found"
		);
		require(
			pairs.contains(address(outPair)),
			"Router: Output pair not found"
		);

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

	/**
	 * @notice Computes the fee based on the pair's sales against the liquidity provided in other pairs.
	 * @dev The more a pair is sold, the higher the fee. This is computed based on the pair's sales relative to the provided liquidity in other pairs.
	 * @param pairAddress The address of the pair for which the fee is being computed.
	 * @param inAmount The input amount for which the fee is being computed.
	 * @return fee The computed fee based on the input amount and the pair's sales.
	 */
	function computeFee(
		address pairAddress,
		uint256 inAmount
	) public view returns (uint256 fee) {
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
		fee = FeeUtil.feePercent(salesDiff, otherLiq, pairsCount());
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
	function pairsCount() public view returns (uint64 count) {
		uint256 total = pairs.length();

		// We are pretty certain this will not overflow ;)
		assembly {
			count := total
		}
	}
}

//SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "@openzeppelin/contracts/interfaces/IERC20.sol";

import "../common/libs/Slippage.sol";
import "../common/libs/TokenPayments.sol";

import "./Errors.sol";
import "./SafePrice.sol";
import "./Amm.sol";
import "./LiquidityPool.sol";

import "./Interface.sol";

contract Pair is IPair {
	using SafePriceUtil for SafePriceData;

	ERC20 public immutable tradeToken;
	uint256 public deposits;
	uint256 public sales;

	uint256 public rewards;
	uint256 public lpSupply;
	IBasePair immutable basePair;

	mapping(address => SafePriceData) safePrices;

	uint256 constant MIN_MINT_DEPOSIT = 4_000;

	constructor(address tradeToken_, address basePairAddr) {
		require(tradeToken_ != address(0), "Pair: Invalid trade token address");
		require(basePairAddr != address(0), "Pair: Invalid base pair address");

		tradeToken = ERC20(tradeToken_);
		require(
			bytes(tradeToken.symbol()).length > 0,
			"Pair: Invalid trade token"
		);

		basePair = IBasePair(basePairAddr);
		// FIXME require(
		// 	bytes(ERC20(Pair(basePairAddr).tradeToken()).symbol()).length > 0,
		// 	"Pair: Invalid base pair contract"
		// );
	}

	function _checkAndReceivePayment(
		ERC20TokenPayment calldata payment
	) internal {
		if (payment.token != tradeToken || payment.amount < MIN_MINT_DEPOSIT) {
			revert("Pair: Bad received payment");
		}

		TokenPayments.receiveERC20(payment);
	}

	function _getReserves()
		internal
		view
		returns (uint256 paymentTokenReserve, uint256 baseTokenReserve)
	{
		return (reserve(), basePair.reserve());
	}

	function _getPayments(
		ERC20TokenPayment calldata incomingPayment
	)
		internal
		returns (
			ERC20TokenPayment memory partPayment,
			ERC20TokenPayment memory basePayment
		)
	{
		bool isInitialLiq = reserve() == 0;

		partPayment.amount = incomingPayment.amount / 2;
		partPayment.token = incomingPayment.token;

		if (!isInitialLiq) {
			// Buy base pair
			_executeSell(partPayment, basePair, 1);
		} else {
			sales += partPayment.amount;
		}
		(
			uint256 paymentTokenReserve,
			uint256 baseTokenReserve
		) = _getReserves();

		// Incase of initial liquidity
		paymentTokenReserve = paymentTokenReserve <= 0
			? incomingPayment.amount
			: paymentTokenReserve;

		basePayment = ERC20TokenPayment({
			amount: Amm.quote(
				partPayment.amount,
				paymentTokenReserve,
				baseTokenReserve
			),
			token: IERC20(Pair(address(basePair)).tradeToken())
		});
	}

	function _takeFromReserve(uint256 amount) internal returns (uint256 taken) {
		if (sales >= amount) {
			sales -= amount;

			return amount;
		}

		if (deposits >= amount) {
			taken = amount;

			deposits -= taken - sales;
			sales = 0;
		} else {
			revert("Amount to be taken is too large");
		}
	}

	function _executeSell(
		ERC20TokenPayment memory inPayment,
		IPair outPair,
		uint256 slippage
	) private {
		uint256 inTokenReserve = reserve();
		uint256 outTokenReserve = outPair.reserve();

		uint256 amountOutMin = Amm.quote(
			Slippage.compute(inPayment.amount, slippage),
			inTokenReserve,
			outTokenReserve
		);
		require(outTokenReserve > amountOutMin, "Pair: not enough reserve");

		safePrices[address(outPair)].updateSafePrice(
			inTokenReserve,
			outTokenReserve
		);

		uint256 initialK = Amm.calculateKConstant(
			inTokenReserve,
			outTokenReserve
		);

		uint256 amountOutOptimal = Amm.getAmountOut(
			inPayment.amount,
			inTokenReserve,
			outTokenReserve
		);
		require(amountOutOptimal >= amountOutMin, "Slippage Exceeded");
		require(amountOutOptimal != 0, "Zero out amount");

		// Complete buy
		sales += inPayment.amount;
		outPair.completeSell(msg.sender, amountOutOptimal);

		uint256 newK = Amm.calculateKConstant(reserve(), outPair.reserve());
		require(initialK <= newK, "ERROR_K_INVARIANT_FAILED");
	}

	function _addBaseLiq(ERC20TokenPayment calldata wholePayment) internal {
		uint256 value = wholePayment.amount / 2;

		_insertLiqValues(AddLiquidityContext({ deposit: value, liq: value }));
		sales += value;
	}

	function _insertLiqValues(AddLiquidityContext memory context) internal {
		deposits += context.deposit;
		lpSupply += context.liq;
	}

	function _addPairLiq(ERC20TokenPayment calldata wholePayment) internal {
		(
			ERC20TokenPayment memory partPayment,
			ERC20TokenPayment memory basePayment
		) = _getPayments(wholePayment);

		(
			uint256 paymentTokenReserve,
			uint256 baseTokenReserve
		) = _getReserves();

		SafePriceData storage safePrice = safePrices[address(basePair)];
		safePrice.updateSafePrice(paymentTokenReserve, baseTokenReserve);

		uint256 initialK = Amm.calculateKConstant(
			paymentTokenReserve,
			baseTokenReserve
		);

		_insertLiqValues(
			AddLiquidityContext({
				deposit: partPayment.amount,
				liq: basePayment.amount
			})
		);

		// Check K values
		(
			uint256 newPaymentTokenReserve,
			uint256 newBaseTokenReserve
		) = _getReserves();
		uint256 newK = Amm.calculateKConstant(
			newPaymentTokenReserve,
			newBaseTokenReserve
		);
		if (initialK > newK) {
			revert ErrorKInvariantFailed();
		}
	}

	function addLiquidity(ERC20TokenPayment calldata wholePayment) external {
		_checkAndReceivePayment(wholePayment);

		bool isBasePair = address(this) == address(basePair);

		if (isBasePair) {
			_addBaseLiq(wholePayment);
		} else {
			_addPairLiq(wholePayment);
		}
	}

	function sell(
		ERC20TokenPayment calldata inPayment,
		IPair outPair,
		uint256 slippage
	) external {
		_checkAndReceivePayment(inPayment);
		_executeSell(inPayment, outPair, slippage);
	}

	function completeSell(address to, uint256 amount) external {
		tradeToken.transfer(to, _takeFromReserve(amount));
		basePair.mintRewards(IPair(address(this)), amount);
	}

	function reserve() public view returns (uint256) {
		return deposits + sales;
	}

	function takeReward(uint256 mintAmount) external {
		rewards += mintAmount;
	}
}

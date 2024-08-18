// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "../common/libs/Fee.sol";
import "../common/libs/Slippage.sol";
import "../common/libs/TokenPayments.sol";

import "./contexts/AddLiquidity.sol";

import "../common/Amm.sol";
import "./Errors.sol";
import "./SafePrice.sol";
import "./Interface.sol";
import "./Knowable.sol";

/**
 * @title Pair
 * @dev This contract manages a trading pair in the DEX, handling liquidity, trading, and fee mechanisms.
 */
contract Pair is IPair, Ownable, KnowablePair {
	using SafePriceUtil for SafePriceData;
	using FeeUtil for FeeUtil.Values;

	// Reserve data
	uint256 public deposits;
	uint256 public sales;

	uint256 public lpSupply;

	ERC20 public immutable tradeToken;
	IBasePair immutable basePair;

	mapping(address => SafePriceData) safePrices;

	uint256 constant MIN_MINT_DEPOSIT = 4_000;

	event LiquidityAdded(
		address indexed from,
		uint256 amount,
		uint256 liqAdded
	);
	event SellExecuted(
		address indexed from,
		address indexed to,
		uint256 amountIn,
		uint256 amountOut,
		uint256 fee
	);
	event BalanceUpdated(address indexed user, uint256 balance);

	/**
	 * @dev Constructor for initializing the Pair contract.
	 * @param tradeToken_ Address of the trade token.
	 * @param basePairAddr Address of the base pair.
	 */
	constructor(address tradeToken_, address basePairAddr) {
		require(tradeToken_ != address(0), "Pair: Invalid trade token address");
		require(basePairAddr != address(0), "Pair: Invalid base pair address");

		tradeToken = ERC20(tradeToken_);
		require(
			bytes(tradeToken.symbol()).length > 0,
			"Pair: Invalid trade token"
		);

		basePair = IBasePair(basePairAddr);
		// TODO Write checks to ensure that base pair trade token is valid ERC20 token
		// require(
		// 	bytes(ERC20(Pair(basePairAddr).tradeToken()).symbol()).length > 0,
		// 	"Pair: Invalid base pair contract"
		// );
	}

	modifier onlyBasePair() {
		require(msg.sender == address(basePair), "not allowed");
		_;
	}

	/**
	 * @dev Internal function to check and receive a payment.
	 * @param payment Payment details.
	 * @param from Address from which payment is received.
	 */
	function _checkAndReceivePayment(
		ERC20TokenPayment calldata payment,
		address from
	) internal {
		_checkAndReceivePayment(payment, from, MIN_MINT_DEPOSIT);
	}

	function _checkAndReceivePayment(
		ERC20TokenPayment calldata payment,
		address from,
		uint256 min
	) internal {
		if (payment.token != tradeToken || payment.amount < min) {
			revert("Pair: Bad received payment");
		}

		TokenPayments.receiveERC20(payment, from);
	}

	function _getReserves()
		internal
		view
		returns (uint256 paymentTokenReserve, uint256 baseTokenReserve)
	{
		return (reserve(), basePair.reserve());
	}

	function _getLiqAdded(
		ERC20TokenPayment calldata payment
	) internal view returns (uint256) {
		(
			uint256 paymentTokenReserve,
			uint256 baseTokenReserve
		) = _getReserves();

		// In case of initial liquidity
		paymentTokenReserve = paymentTokenReserve <= 0
			? payment.amount
			: paymentTokenReserve;

		return Amm.quote(payment.amount, paymentTokenReserve, baseTokenReserve);
	}

	function _takeFromReserve(uint256 amount) internal returns (uint256 taken) {
		if (sales >= amount) {
			sales -= amount;
			return amount;
		}

		if ((deposits + sales) >= amount) {
			taken = amount;
			deposits -= taken - sales;
			sales = 0;
		} else {
			revert("Amount to be taken is too large");
		}
	}

	function _completeSell(
		ERC20TokenPayment memory inPayment,
		address from,
		IPair outPair,
		uint256 outAmount
	) internal virtual {
		sales += inPayment.amount;
		outPair.completeSell(from, outAmount);
		emit BalanceUpdated(from, tradeToken.balanceOf(from));
		emit BalanceUpdated(address(this), tradeToken.balanceOf(address(this)));
	}

	event BurntFees(address indexed pair, uint256 fee);

	/**
	 * @notice Takes fee and update balances of beneficiaries
	 * @dev This must be called on the out pair side
	 * @param referrer the user address to receive part of fee
	 * @param amount amount to compute and deduct fee from
	 * @param totalFeePercent the fee percentage
	 */
	function takeFees(
		address referrer,
		uint256 amount,
		uint256 totalFeePercent
	) external isKnownPair returns (uint256 amountOut) {
		uint256 fee = (totalFeePercent * amount) / FeeUtil.MAX_PERCENT;

		amountOut = amount - fee;

		FeeUtil.Values memory values = FeeUtil.splitFee(fee);

		// Give liqProviders value
		deposits += _takeFromReserve(values.liqProvidersValue);

		uint256 toBurn = values.toBurnValue;
		if (referrer != address(0) && values.referrerValue > 0) {
			tradeToken.transfer(
				referrer,
				_takeFromReserve(values.referrerValue)
			);
		} else {
			toBurn += values.referrerValue;
		}

		// Increasing sales genrally implies the `toBurn`
		// is available for ecosystem wide usage
		sales += _takeFromReserve(toBurn);
		emit BurntFees(address(this), toBurn);
	}

	function _executeSell(
		ERC20TokenPayment memory inPayment,
		address from,
		address referrer,
		Pair outPair,
		uint256 slippage,
		uint256 totalFeePercent
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

		amountOutOptimal = outPair.takeFees(
			referrer,
			amountOutOptimal,
			totalFeePercent
		);

		require(amountOutOptimal >= amountOutMin, "Slippage Exceeded");
		require(amountOutOptimal != 0, "Pair: Zero out amount");

		_completeSell(inPayment, from, outPair, amountOutOptimal);

		uint256 newK = Amm.calculateKConstant(reserve(), outPair.reserve());
		require(initialK <= newK, "ERROR_K_INVARIANT_FAILED");

		emit SellExecuted(
			from,
			address(outPair),
			inPayment.amount,
			amountOutOptimal,
			totalFeePercent
		);
	}

	function _addBaseLiq(ERC20TokenPayment calldata wholePayment) internal {
		uint256 value = wholePayment.amount;
		_insertLiqValues(AddLiquidityContext({ deposit: value, liq: value }));
	}

	function _insertLiqValues(AddLiquidityContext memory context) internal {
		deposits += context.deposit;
		lpSupply += context.liq;
	}

	function _addPairLiq(ERC20TokenPayment calldata wholePayment) internal {
		uint256 liqAdded = _getLiqAdded(wholePayment);

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
			AddLiquidityContext({ deposit: wholePayment.amount, liq: liqAdded })
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

		require(newK > initialK, "Pair: K Invariant Failed");
	}

	/**
	 * @notice Adds liquidity to the pair.
	 * @param wholePayment Details of the payment for adding liquidity.
	 * @param from Address from which liquidity is added.
	 * @return liqAdded Amount of liquidity added.
	 */
	function addLiquidity(
		ERC20TokenPayment calldata wholePayment,
		address from
	) external onlyOwner returns (uint256 liqAdded) {
		_checkAndReceivePayment(wholePayment, from);

		bool isBasePair = address(this) == address(basePair);

		uint256 initalLp = lpSupply;
		if (isBasePair) {
			_addBaseLiq(wholePayment);
		} else {
			_addPairLiq(wholePayment);
		}
		require(lpSupply > initalLp, "Pair: invalid liquidity addition");
		liqAdded = lpSupply - initalLp;

		emit LiquidityAdded(from, wholePayment.amount, liqAdded);
		emit BalanceUpdated(from, tradeToken.balanceOf(from));
		emit BalanceUpdated(address(this), tradeToken.balanceOf(address(this)));
	}

	/**
	 * @notice Executes a sell order.
	 * @param caller Address of the caller.
	 * @param referrerOfCaller Address of the referrer of the caller.
	 * @param inPayment Details of the payment for the sell order.
	 * @param outPair Address of the pair to sell to.
	 * @param slippage Maximum slippage allowed.
	 * @param totalFeePercent Total fee percentage.
	 */
	function sell(
		address caller,
		address referrerOfCaller,
		ERC20TokenPayment calldata inPayment,
		Pair outPair,
		uint256 slippage,
		uint256 totalFeePercent
	) external onlyOwner {
		_checkAndReceivePayment(inPayment, caller, 0);
		_executeSell(
			inPayment,
			caller,
			referrerOfCaller,
			outPair,
			slippage,
			totalFeePercent
		);
	}

	/**
	 * @notice Completes a sell order on the outPair side.
	 * @param to Address to which the amount is transferred.
	 * @param amount Amount to be transferred.
	 */
	function completeSell(address to, uint256 amount) external isKnownPair {
		tradeToken.transfer(to, _takeFromReserve(amount));
		emit BalanceUpdated(to, tradeToken.balanceOf(to));
		emit BalanceUpdated(address(this), tradeToken.balanceOf(address(this)));
	}

	/**
	 * @notice Returns the total amount of tradeToken that can be bought from this Pair.
	 * @return The reserve amount.
	 */
	function reserve() public view returns (uint256) {
		return deposits + sales;
	}
}

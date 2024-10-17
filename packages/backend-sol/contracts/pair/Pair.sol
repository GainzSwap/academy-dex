// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "../common/libs/Fee.sol";
import "../common/libs/Slippage.sol";
import "../common/libs/TokenPayments.sol";

import "./contexts/AddLiquidity.sol";

import "../common/Amm.sol";
import "./Knowable.sol";

import { LpToken } from "../modules/LpToken.sol";
import "../common/utils.sol";

import { UpgradeableBeacon } from "@openzeppelin/contracts/proxy/beacon/UpgradeableBeacon.sol";
import { BeaconProxy } from "@openzeppelin/contracts/proxy/beacon/BeaconProxy.sol";

uint256 constant RPS_DIVISION_CONSTANT = 1e36;

/**
 * @title Pair
 * @dev This contract manages a trading pair in the DEX, handling liquidity, trading, and fee mechanisms.
 */
contract Pair is KnowablePair {
	using FeeUtil for FeeUtil.Values;
	using TokenPayments for TokenPayment;
	/// @custom:storage-location erc7201:pair.main
	struct MainStorage {
		uint256 deposits;
		uint256 sales;
		uint256 depValuePerShare;
		uint256 lpSupply;
		address tradeToken;
		Pair basePair;
	}

	// keccak256(abi.encode(uint256(keccak256("pair.main")) - 1)) & ~bytes32(uint256(0xff));
	bytes32 private constant MAIN_STORAGE_LOCATION =
		0x97d1e57c471298f17711cbbbe041432b8615000019f983389f60cd43dafec500;

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

	function _getMainStorage() internal pure returns (MainStorage storage $) {
		assembly {
			$.slot := MAIN_STORAGE_LOCATION
		}
	}

	// Use $ to access storage variables
	function deposits() public view returns (uint256) {
		return _getMainStorage().deposits;
	}

	function sales() public view returns (uint256) {
		return _getMainStorage().sales;
	}

	function lpSupply() public view returns (uint256) {
		return _getMainStorage().lpSupply;
	}

	function tradeToken() public view returns (address) {
		return _getMainStorage().tradeToken;
	}

	function basePair() public view returns (Pair) {
		return _getMainStorage().basePair;
	}

	/**
	 * @dev Constructor for initializing the Pair contract.
	 * @param tradeToken_ Address of the trade token.
	 * @param basePairAddr Address of the base pair.
	 */
	function initialize(
		address tradeToken_,
		address basePairAddr
	) public initializer {
		__Ownable_init(msg.sender);
		_setTradeToken(tradeToken_);
		_setBasePair(basePairAddr);
	}

	function _setTradeToken(address tradeToken_) internal virtual {
		require(tradeToken_ != address(0), "Pair: Invalid trade token address");

		require(isERC20(tradeToken_), "Pair: Invalid trade token");
		_getMainStorage().tradeToken = tradeToken_;
	}

	function _setBasePair(address basePairAddr) internal virtual {
		require(basePairAddr != address(0), "Pair: Invalid base pair address");
		MainStorage storage $ = _getMainStorage();

		$.basePair = Pair(basePairAddr);
		require(
			isERC20(Pair(basePairAddr).tradeToken()),
			"Pair: Invalid base pair contract"
		);
	}

	modifier onlyBasePair() {
		MainStorage storage $ = _getMainStorage();

		require(msg.sender == address($.basePair), "not allowed");
		_;
	}

	/**
	 * @dev Internal function to check and receive a payment.
	 * @param payment Payment details.
	 * @param from Address from which payment is received.
	 */
	function _checkAndReceivePayment(
		TokenPayment calldata payment,
		address from
	) internal {
		_checkAndReceivePayment(payment, from, MIN_MINT_DEPOSIT);
	}

	function _checkAndReceivePayment(
		TokenPayment calldata payment,
		address from,
		uint256 min
	) internal {
		MainStorage storage $ = _getMainStorage();

		if (payment.token != address($.tradeToken) || payment.amount < min) {
			revert("Pair: Bad received payment");
		}

		payment.receiveToken(from);
	}

	function _getReserves()
		internal
		view
		returns (uint256 paymentTokenReserve, uint256 baseTokenReserve)
	{
		MainStorage storage $ = _getMainStorage();

		return (reserve(), $.basePair.reserve());
	}

	function _getLiqAdded(
		TokenPayment calldata payment
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

	function _takeFromReserve(uint256 amount) internal {
		MainStorage storage $ = _getMainStorage();

		if ($.deposits >= amount) {
			$.deposits -= amount;
			return;
		}

		if (($.deposits + $.sales) >= amount) {
			$.sales -= amount - $.deposits;
			$.deposits = 0;
		} else {
			revert("Amount to be taken is too large");
		}
	}

	event BurntFees(address indexed pair, uint256 fee);

	/**
	 * @notice Takes fee and update balances of beneficiaries
	 * @dev This must be called on the out pair side
	 * @param referrer the user address to receive part of fee
	 * @param receiver the address buying this token
	 * @param amount amount to compute and deduct fee from
	 * @param totalFeePercent the fee percentage
	 */
	function takeFeesAndTransferTokens(
		address receiver,
		address referrer,
		uint256 amount,
		uint256 totalFeePercent
	) external isKnownPair returns (uint256 amountOut, uint256 toBurn) {
		_takeFromReserve(amount);

		uint256 fee = (totalFeePercent * amount) / FeeUtil.MAX_PERCENT;
		amountOut = amount - fee;

		require(amountOut != 0, "Pair: Zero out amount");

		FeeUtil.Values memory values = FeeUtil.splitFee(fee);
		MainStorage storage $ = _getMainStorage();

		toBurn = values.toBurnValue;
		// Distribute values
		{
			if (referrer != address(0) && values.referrerValue > 0) {
				TokenPayment({
					nonce: 0,
					amount: values.referrerValue,
					token: $.tradeToken
				}).sendToken(referrer);
			} else {
				toBurn += values.referrerValue;
			}

			// Increasing sales genrally implies the `toBurn`
			// is available for ecosystem wide usage
			require(toBurn > 0, "Pair: Swap amount too low");
			_addToSales(toBurn);

			// Give liqProviders value
			$.lpSupply > 0
				? _addToDeposits(values.liqProvidersValue)
				: _addToSales(values.liqProvidersValue);

			// Send bought tokens to receiver
			TokenPayment({ nonce: 0, amount: amountOut, token: $.tradeToken })
				.sendToken(receiver);
			if ($.basePair == (this)) {
				// Zero out toBurn since base pair is the pair that collects the burn fees
				toBurn = 0;
			}
		}
		emit BurntFees(address(this), toBurn);
	}

	function _executeSell(
		uint256 amountIn,
		address from,
		address referrer,
		Pair outPair,
		uint256 slippage,
		uint256 totalFeePercent
	) private returns (uint256 burntFee, uint256 amountOut) {
		uint256 inTokenReserve = reserve();
		uint256 outTokenReserve = outPair.reserve();

		uint256 amountOutMin = Amm.quote(
			Slippage.compute(amountIn, slippage),
			inTokenReserve,
			outTokenReserve
		);

		{
			uint256 initialK = Amm.calculateKConstant(
				inTokenReserve,
				outTokenReserve
			);

			uint256 amountOutOptimal = Amm.getAmountOut(
				amountIn,
				inTokenReserve,
				outTokenReserve
			);
			(amountOut, burntFee) = outPair.takeFeesAndTransferTokens(
				from,
				referrer,
				amountOutOptimal,
				totalFeePercent
			);

			require(amountOut >= amountOutMin, "Pair: Slippage Exceeded");
			_addToSales(amountIn);

			MainStorage storage $ = _getMainStorage();
			uint256 newK = Amm.calculateKConstant(
				$.deposits + $.sales + amountIn,
				outPair.reserve()
			);
			require(initialK <= newK, "ERROR_K_INVARIANT_FAILED");
		}

		emit SellExecuted(
			from,
			address(outPair),
			amountIn,
			amountOut,
			totalFeePercent
		);
	}

	function _insertLiqValues(AddLiquidityContext memory context) internal {
		MainStorage storage $ = _getMainStorage();

		$.lpSupply += context.liq;
		_addToDeposits(context.deposit);
	}

	function _addLiq(TokenPayment calldata wholePayment) internal virtual {
		uint256 liqAdded = _getLiqAdded(wholePayment);

		(
			uint256 paymentTokenReserve,
			uint256 baseTokenReserve
		) = _getReserves();

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

	function _addToDeposits(uint256 addition) internal {
		MainStorage storage $ = _getMainStorage();

		$.deposits += addition;
	}

	function _addToSales(uint256 addition) internal virtual {
		MainStorage storage $ = _getMainStorage();

		$.sales += addition;
	}

	/**
	 * @notice Adds liquidity to the pair.
	 * @param wholePayment Details of the payment for adding liquidity.
	 * @param from Address from which liquidity is added.
	 * @return liqAdded Amount of liquidity added.
	 */
	function addLiquidity(
		TokenPayment calldata wholePayment,
		address from
	) external onlyOwner returns (uint256 liqAdded) {
		MainStorage storage $ = _getMainStorage();
		_checkAndReceivePayment(wholePayment, from);

		uint256 initalLp = $.lpSupply;
		_addLiq(wholePayment);
		require($.lpSupply > initalLp, "Pair: invalid liquidity addition");

		liqAdded = $.lpSupply - initalLp;

		emit LiquidityAdded(from, wholePayment.amount, liqAdded);
	}

	function _removeLiq(
		MainStorage storage $,
		LpToken.LpBalance memory liquidity,
		uint256 liqToRemove
	) internal returns (uint256 depositClaimed) {
		uint256 totalDepositClaimed = (liquidity.amount * $.deposits) /
			$.lpSupply;

		// Calculate the deposit to be claimed based on the liquidity being removed
		depositClaimed = (liqToRemove * totalDepositClaimed) / liquidity.amount;

		$.deposits -= depositClaimed;
		$.lpSupply -= liqToRemove;
	}

	// function _removeLiq(
	// 	MainStorage storage $,
	// 	LpToken.LpBalance memory liquidity,
	// 	uint256 liqToRemove
	// ) internal virtual returns (uint256 depositClaimed) {
	// 	uint256 availDeposits = $.deposits;
	// 	uint256 depositsAtLiq = (liquidity.attributes.depValuePerShare *
	// 		$.lpSupply) / RPS_DIVISION_CONSTANT;
	// 	uint256 depositsAtGlobal = ($.depValuePerShare * $.lpSupply) /
	// 		RPS_DIVISION_CONSTANT;

	// 	console.log("\n availDeposits    ", availDeposits);
	// 	console.log("depositsAtLiq      ", depositsAtLiq);
	// 	console.log("depositsAtGlobal   ", depositsAtGlobal); // if ($.depValuePerShare < liquidity.attributes.depValuePerShare) {
	// 	// 	uint256 depositsAtLiqDelta = (($.depValuePerShare) * liquidity.amount) /
	// 	// 		RPS_DIVISION_CONSTANT;
	// 	// 	console.log("depositsAtLiqDelta ", depositsAtLiqDelta);

	// 	// 	if (depositsAtLiqDelta < availDeposits) {
	// 	// 		availDeposits -= depositsAtLiqDelta;
	// 	// 	} else {
	// 	// 		availDeposits = 0;
	// 	// 	}
	// 	// }

	// 	// Calculate the total deposit that can be claimed based on the updated depValuePerShare
	// 	// uint256 computedDepositsLeft = $.deposits;
	// 	if ($.depValuePerShare < liquidity.attributes.depValuePerShare) {
	// 		uint256 depositsDeduction = ((liquidity
	// 			.attributes
	// 			.depValuePerShare - $.depValuePerShare) * $.lpSupply) /
	// 			RPS_DIVISION_CONSTANT;

	// 		console.log("depositsDeduction       ", depositsDeduction);
	// 		// 	console.log("computedDepositsLeft    ", computedDepositsLeft);
	// 		// 	computedDepositsLeft = depositsDeduction;
	// 		// 	// require(
	// 		// 	// 	depositsDeduction <= totalDeposits,
	// 		// 	// 	"Pair: depositsDeductions too large"
	// 		// 	// );
	// 		// 	// totalDeposits = depositsDeduction;
	// 	}
	// 	uint256 totalDeposits = (liquidity.amount * availDeposits) / $.lpSupply;

	// 	// Calculate the deposit to be claimed based on the liquidity being removed
	// 	depositClaimed = (liqToRemove * totalDeposits) / liquidity.amount;
	// 	console.log("depositClaimed", depositClaimed);
	// 	_takeFromDeposits(depositClaimed);
	// }

	/**
	 * @notice Removes liquidity from the pool and claims the corresponding deposit.
	 * @dev This function updates the LP's liquidity balance and claims a proportionate amount of the deposit.
	 *      It ensures that the LP's deposit value per share is up-to-date before calculating the deposit to be claimed.
	 * @param liquidity The current liquidity balance of the LP token, including attributes like `depValuePerShare`.
	 * @param liqToRemove The amount of liquidity to be removed from the pool.
	 * @param from The address from which the liquidity is being removed.
	 * @return liq The updated liquidity balance after removal.
	 * @return depositClaimed The amount of deposit claimed by the LP.
	 */
	function removeLiquidity(
		LpToken.LpBalance memory liquidity,
		uint256 liqToRemove,
		address from
	)
		external
		onlyOwner
		returns (LpToken.LpBalance memory liq, uint256 depositClaimed)
	{
		MainStorage storage $ = _getMainStorage();
		require(liquidity.amount > 0, "Pair: LP balance is zero");
		require(
			liqToRemove <= liquidity.amount && liqToRemove <= $.lpSupply,
			"Pair: Invalid liquidity removal amount"
		);

		depositClaimed = _removeLiq($, liquidity, liqToRemove);

		// Reduce global lpSupply by the LP's total liquidity amount
		liquidity.amount -= liqToRemove;

		// Transfer the claimed deposit to the `from` address
		if (depositClaimed > 0) {
			TokenPayment({
				nonce: 0,
				amount: depositClaimed,
				token: $.tradeToken
			}).sendToken(from);
		}

		// Return the updated liquidity balance and claimed deposit
		return (liquidity, depositClaimed);
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
		TokenPayment calldata inPayment,
		Pair outPair,
		uint256 slippage,
		uint256 totalFeePercent
	) external onlyOwner returns (uint256 burntFee, uint256 amountOut) {
		_checkAndReceivePayment(inPayment, caller, 0);
		(burntFee, amountOut) = _executeSell(
			inPayment.amount,
			caller,
			referrerOfCaller,
			outPair,
			slippage,
			totalFeePercent
		);
	}

	/**
	 * @notice Returns the total amount of tradeToken that can be bought from this Pair.
	 * @return The reserve amount.
	 */
	function reserve() public view returns (uint256) {
		return deposits() + sales();
	}
}

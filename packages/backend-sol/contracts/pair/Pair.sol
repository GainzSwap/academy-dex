//SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "@openzeppelin/contracts/interfaces/IERC20.sol";

import "../common/libs/Slippage.sol";
import "../common/libs/TokenPayments.sol";

import "./Errors.sol";
import "./SafePrice.sol";
import "./Amm.sol";
import "./LiquidityPool.sol";

contract Pair {
	using SafePriceUtil for SafePriceData;

	ERC20 public immutable tradeToken;
	uint256 public deposits;
	uint256 public sales;

	uint256 public rewards;
	uint256 public lpSupply;
	Pair immutable basePair;

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

		basePair = Pair(basePairAddr);
		// FIXME require(
		// 	bytes(basePair.tradeToken().symbol()).length > 0,
		// 	"Pair: Invalid base pair contract"
		// );
	}

	function _checkReceivedPayment(
		ERC20TokenPayment memory payment
	) internal view {
		if (payment.token != tradeToken || payment.amount < MIN_MINT_DEPOSIT) {
			revert("Pair: Bad received payment");
		}
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
		view
		returns (
			ERC20TokenPayment memory payment,
			ERC20TokenPayment memory basePayment
		)
	{
		(
			uint256 paymentTokenReserve,
			uint256 baseTokenReserve
		) = _getReserves();

		payment.amount = incomingPayment.amount / 2;
		payment.token = incomingPayment.token;

		// Incase of initial liquidity
		paymentTokenReserve = paymentTokenReserve <= 0
			? incomingPayment.amount
			: paymentTokenReserve;

		basePayment = ERC20TokenPayment({
			amount: Amm.quote(
				payment.amount,
				paymentTokenReserve,
				baseTokenReserve
			),
			token: IERC20(address(basePair))
		});

		// TODO buy base pair and add the other half of payment to deposit
	}

	function addLiquidity(ERC20TokenPayment calldata payment_) external {
		_checkReceivedPayment(payment_);
		TokenPayments.receiveERC20(payment_);

		bool isBasePair = address(this) == address(basePair);

		if (isBasePair) {
			deposits += payment_.amount / 2;
			sales += payment_.amount / 2;

			return;
		}

		(
			ERC20TokenPayment memory payment,
			ERC20TokenPayment memory basePayment
		) = _getPayments(payment_);

		(
			uint256 paymentTokenReserve,
			uint256 baseTokenReserve
		) = _getReserves();

		SafePriceData storage safePrice = safePrices[
			address(basePayment.token)
		];
		safePrice.updateSafePrice(paymentTokenReserve, baseTokenReserve);

		uint256 initialK = Amm.calculateKConstant(
			paymentTokenReserve,
			baseTokenReserve
		);

		AddLiquidityContext memory addLiqContext = AddLiquidityContextUtil
			.newContext(payment, basePayment);
		deposits += addLiqContext.depositAdded;
		lpSupply += addLiqContext.liqAdded;

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

	function reserve() public view returns (uint256) {
		return deposits + sales;
	}
}

//SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

uint256 constant MAX_PERCENTAGE = 100_000;
uint256 constant MAX_FEE_PERCENTAGE = 5_000;

abstract contract ConfigModule {
	error ErrorBadPercents();

	address public firstToken;
	address public secondToken;

	uint256 private totalFeePercent;
	uint256 private specialFeePercent;

	address internal routerAddress;
	address internal initialLiquidityAdder;

	mapping(address => uint256) pairReserve;
	uint256 lpTokenSupply;
	address lpTokenIdentifier;

	function _setFeePercents(
		uint256 totalFeePercent_,
		uint256 specialFeePercent_
	) internal {
		if (
			totalFeePercent < specialFeePercent ||
			totalFeePercent > MAX_PERCENTAGE
		) revert ErrorBadPercents();

		totalFeePercent = totalFeePercent_;
		specialFeePercent = specialFeePercent_;
	}
}

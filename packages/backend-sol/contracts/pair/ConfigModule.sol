//SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "./LpToken.sol";

uint256 constant MAX_PERCENTAGE = 100_000;
uint256 constant MAX_FEE_PERCENTAGE = 5_000;

abstract contract ConfigModule {
	error ErrorBadPercents();

	ERC20 public firstToken;
	ERC20 public secondToken;

	uint256 private totalFeePercent;
	uint256 private specialFeePercent;

	address internal routerAddress;
	address internal initialLiquidityAdder;

	mapping(address => uint256) pairReserve;
	uint256 lpTokenSupply;
	LpToken lpToken;

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

	function lpTokenBalanceOf(address user) external view returns (uint256) {
		return lpToken.balanceOf(user);
	}

	function lpAddress() public view returns (address) {
		return address(lpToken);
	}
}

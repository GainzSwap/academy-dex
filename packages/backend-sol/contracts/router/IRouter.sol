// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import { TokenPayment } from "../common/libs/TokenPayments.sol";

interface IRouter {
	function createPair(
		TokenPayment calldata payment
	)
		external
		payable
		returns (address pairAddress, TokenPayment memory lpPayment);

	function generateRewards() external;

	// function claimRewards(
	// 	uint256[] memory nonces
	// ) external returns (uint256 totalClaimed, uint256[] memory newNonces);

	function getClaimableRewardsByNonces(
		uint256[] memory nonces
	) external view returns (uint256 totalClaimable);

	function tokenIsListed(address tokenAddress) external view returns (bool);

	function addLiquidity(
		TokenPayment memory wholePayment
	) external payable returns (uint256);
}

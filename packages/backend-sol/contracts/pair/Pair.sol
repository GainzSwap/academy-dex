//SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "../common/modules/PausableModule.sol";
import "../common/modules/BannedAddressModule.sol";

import "./ConfigModule.sol";

import "./pair_actions/AddLiquidity.sol";
import "./pair_actions/RemoveLiquidity.sol";

contract Pair is StorageCache, PausableModule, BannedAdddressModule, Ownable {
	error InvalidTokenAddress();
	error ErrorSameTokens();

	SafePriceData safePriceData;

	constructor(
		address firstToken_,
		address secondToken_,
		address routerAddress_,
		address routerOwnerAddress,
		uint256 totalFeePercent_,
		uint256 specialFeePercent_,
		address initialLiquidityAdder_
	) {
		if (firstToken_ == address(0)) revert InvalidTokenAddress();
		if (secondToken_ == address(0)) revert InvalidTokenAddress();
		if (firstToken_ == secondToken_) revert ErrorSameTokens();

		_setFeePercents(totalFeePercent_, specialFeePercent_);
		state = State.Inactive;
		routerAddress = routerAddress_;

		firstToken = ERC20(firstToken_);
		secondToken = ERC20(secondToken_);
		string memory lpSymbol = string.concat(
			"LP-",
			firstToken.symbol(),
			"-",
			secondToken.symbol()
		);
		lpToken = new LpToken(lpSymbol, lpSymbol);

		initialLiquidityAdder = initialLiquidityAdder_;

		_setupRole(DEFAULT_ADMIN_ROLE, msg.sender);

		bytes32[] memory allPermissions = new bytes32[](3);
		allPermissions[0] = PermissionOWNER;
		allPermissions[1] = PermissionADMIN;
		allPermissions[2] = PermissionPAUSE;

		addRoles(allPermissions, routerAddress);
		addRoles(allPermissions, routerOwnerAddress);

		addBannedAddress(address(this));
	}

	function addLiquidity(
		uint256 firstTokenAmountMin,
		uint256 secondTokenAmountMin,
		ERC20TokenPayment calldata firstPayment,
		ERC20TokenPayment calldata secondPayment
	) external dropCache(state) returns (AddLiquidityResultType memory output) {
		return
			AddLiquidityUtil.addLiquidity(
				storageCache,
				safePriceData,
				firstTokenAmountMin,
				secondTokenAmountMin,
				firstPayment,
				secondPayment
			);
	}

	function removeLiquidity(
		uint256 firstTokenAmountMin,
		uint256 secondTokenAmountMin,
		ERC20TokenPayment calldata payment
	)
		external
		dropCache(state)
		returns (RemoveLiquidityResultType memory output)
	{
		return
			RemoveLiquidityUtil.removeLiquidity(
				storageCache,
				safePriceData,
				firstTokenAmountMin,
				secondTokenAmountMin,
				payment
			);
	}
}

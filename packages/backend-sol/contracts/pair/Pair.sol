//SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

import "../common/modules/PausableModule.sol";
import "../common/modules/BannedAddressModule.sol";

import "./ConfigModule.sol";

import "./pair_actions/AddLiquidityModule.sol";

contract Pair is
	ConfigModule,
	PausableModule,
	BannedAdddressModule,
	AddLiquidityModule
{
	error InvalidTokenAddress();
	error ErrorSameTokens();

	constructor(
		address firstToken_,
		address secondToken_,
		address routerAddress_,
		address routerOwnerAddress,
		uint256 totalFeePercent_,
		uint256 specialFeePercent_,
		address initialLiquidityAdder_
	) ERC20("Pair-LP", "PLP") {
		if (firstToken_ == address(0)) revert InvalidTokenAddress();
		if (secondToken_ == address(0)) revert InvalidTokenAddress();
		if (firstToken_ == secondToken_) revert ErrorSameTokens();

		_setFeePercents(totalFeePercent_, specialFeePercent_);
		state = State.Inactive;
		routerAddress = routerAddress_;

		firstToken = firstToken_;
		secondToken = secondToken_;
		lpTokenIdentifier = address(this);

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
}

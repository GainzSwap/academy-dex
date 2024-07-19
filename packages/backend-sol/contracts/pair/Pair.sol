//SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "../common/modules/PausableModule.sol";
import "../common/modules/PermissionsModule.sol";
import "../common/modules/BannedAddressModule.sol";

import "./ConfigModule.sol";

contract Pair is
	ConfigModule,
	PausableModule,
	PermissionsModule,
	BannedAdddressModule
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
	) {
		if (firstToken_ == address(0)) revert InvalidTokenAddress();
		if (secondToken_ == address(0)) revert InvalidTokenAddress();
		if (firstToken_ == secondToken_) revert ErrorSameTokens();

		// Can we set lp id here?

		_setFeePercents(totalFeePercent_, specialFeePercent_);
		state = State.Inactive;
		routerAddress = routerAddress_;

		firstToken = firstToken_;
		secondToken = secondToken_;

		initialLiquidityAdder = initialLiquidityAdder_;

		_setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
		bytes32 allPermissions = PermissionOWNER |
			PermissionADMIN |
			PermissionPAUSE;
		grantRole(allPermissions, routerAddress);
		grantRole(allPermissions, routerOwnerAddress);

		addBannedAddress(address(this));
	}
}

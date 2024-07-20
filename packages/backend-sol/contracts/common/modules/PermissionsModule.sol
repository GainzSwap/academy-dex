//SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "@openzeppelin/contracts/access/AccessControl.sol";

import "../../pair/Errors.sol";

bytes32 constant PermissionNONE = keccak256("NONE");
bytes32 constant PermissionOWNER = keccak256("OWNER");
bytes32 constant PermissionADMIN = keccak256("ADMIN");
bytes32 constant PermissionPAUSE = keccak256("PAUSE");

enum Permission {
	NONE,
	OWNER,
	ADMIN,
	PAUSE
}

abstract contract PermissionsModule is AccessControl {
	function addRoles(bytes32[] memory roles, address user) internal {
		for (uint index = 0; index < roles.length; index++) {
			grantRole(roles[index], user);
		}
	}

	function requireCallerHasPausePermissions() internal view {
		requireCallerAnyOf(PermissionPAUSE);
	}

	function requireCallerAnyOf(bytes32 permissions) internal view {
		if (!hasRole(permissions, msg.sender)) {
			revert ErrorPermissionDenied();
		}
	}
}

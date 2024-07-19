//SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "@openzeppelin/contracts/access/AccessControl.sol";

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

abstract contract PermissionsModule is AccessControl {}

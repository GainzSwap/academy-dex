//SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "../libs/Whitelist.sol";

abstract contract BannedAdddressModule {
	whitelist internal bannedAddresses;
	using Whitelist for whitelist;

	function addBannedAddress(address addrs) internal {
		bannedAddresses.add(addrs);
	}
}

//SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

struct whitelist {
	mapping(address => bool) whitelist;
}

library Whitelist {
	function add(whitelist storage list, address addrs) internal {
		list.whitelist[addrs] = true;
	}
}

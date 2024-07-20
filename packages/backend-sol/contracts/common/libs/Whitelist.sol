//SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

struct whitelist {
	mapping(address => bool) whitelist;
}

library Whitelist {
	function add(whitelist storage self, address addrs) internal {
		self.whitelist[addrs] = true;
	}
}

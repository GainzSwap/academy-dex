// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TestingERC20 is ERC20 {
	constructor(
		string memory name_,
		string memory symbol_
	) ERC20(name_, symbol_) {
		_mint(msg.sender, 3_000_000 * 10 ** 18);
	}

	function mint(address to, uint256 amt) external {
		_mint(to, amt);
	}
}

// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "../common/libs/MintableERC20.sol";

contract TestingERC20 is MintableERC20 {
	constructor(
		string memory name_,
		string memory symbol_
	) MintableERC20(name_, symbol_) {
		_mint(owner(), 3_000_000 * 10 ** 18);
	}
}

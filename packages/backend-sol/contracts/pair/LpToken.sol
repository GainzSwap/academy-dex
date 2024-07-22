// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

contract LpToken is Ownable, ERC20, ERC20Burnable {
	constructor(
		string memory name_,
		string memory symbol_
	) ERC20(name_, symbol_) {}

	function localMint(uint256 amount) public onlyOwner {
		_mint(owner(), amount);
	}
}

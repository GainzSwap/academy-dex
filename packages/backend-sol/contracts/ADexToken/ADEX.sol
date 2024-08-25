// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

import { ADexInfo } from "./AdexInfo.sol";

contract ADEX is ERC20, Ownable, ERC20Burnable {
	constructor() ERC20("Academy-DEX-BaseToken", "ADEX") {
		_mint(owner(), ADexInfo.MAX_SUPPLY);
	}
}

// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "../pair/BasePair.sol";

contract TestingBasePair is BasePair {
	function mint(address to, uint256 amt) external {
		MintableERC20(address(tradeToken)).mint(to, amt);
	}
}

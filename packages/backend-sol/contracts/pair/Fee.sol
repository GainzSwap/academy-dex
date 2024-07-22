// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

library FeeUtil {
	function burn(ERC20Burnable token, uint256 amount) internal {
		if (amount > 0) {
			token.burn(amount);
		}
	}
}

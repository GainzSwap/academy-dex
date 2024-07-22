//SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "@openzeppelin/contracts/interfaces/IERC20.sol";

struct ERC20TokenPayment {
	IERC20 token;
	uint256 amount;
}

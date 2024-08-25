// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract WEDU is ERC20 {
	constructor() ERC20("Wrapped EduChain", "WEDU") {}

	// Fallback function to receive EDU and wrap it
	receive() external payable {
		deposit();
	}

	// Deposit function to wrap EDU into WEDU
	function deposit() public payable {
		_mint(msg.sender, msg.value);
	}

	// Withdraw function to unwrap WEDU into EDU
	function withdraw(uint256 amount) public {
		require(balanceOf(msg.sender) >= amount, "WEDU: Insufficient balance");
		_burn(msg.sender, amount);
		payable(msg.sender).transfer(amount);
	}

	function receiveForSpender(address owner, address spender) public payable {
		_mint(owner, msg.value);
		_approve(owner, spender, msg.value);
	}
}

//SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

enum State {
	Inactive,
	Active,
	PartialActive
}

abstract contract PausableModule {
	State public state;
}

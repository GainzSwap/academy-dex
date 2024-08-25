// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

interface IPair {
	function reserve() external view returns (uint256);
}

interface IBasePair is IPair {}

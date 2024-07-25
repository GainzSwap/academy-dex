// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity 0.8.26;

interface IPair {
	function reserve() external view returns (uint256);

	function completeSell(address to, uint256 amount) external;
}

interface IBasePair is IPair {
	function mintRewards(uint256 amount) external;

	function burnFee(uint256 amount) external;
}

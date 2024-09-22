// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

contract ComputeStorageSlot {
	function slot(bytes memory key) external pure returns (bytes32) {
		return
			keccak256(abi.encode(uint256(keccak256(key)) - 1)) &
			~bytes32(uint256(0xff));
	}
}

// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import { OwnableUpgradeable } from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

abstract contract KnowablePair is OwnableUpgradeable {
	modifier isKnownPair() {
		require(owner() == OwnableUpgradeable(msg.sender).owner(), "not allowed");
		require(msg.sender != address(this), "self cannnot be known pair");
		_;
	}
}

// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "./Pair.sol";
import { ADEX } from "../ADexToken/ADEX.sol";

/**
 * @title BasePair
 * @dev This contract represents a base pair in the DEX, implementing mintable tokens and fee burning mechanisms.
 */
contract BasePair is Pair, IBasePair {
	constructor(address adexAddress) Pair(adexAddress, address(this)) {}
}

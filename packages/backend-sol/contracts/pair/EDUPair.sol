// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import { Pair, TokenPayment, AddLiquidityContext } from "./Pair.sol";
import { WEDU } from "../common/libs/WEDU.sol";
import { TransparentUpgradeableProxy } from "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";

/// @title EDUPair
/// @notice A specialized pair contract for handling EduChain (EDU) token trades.
/// @dev Inherits from the `Pair` contract and customizes it to work specifically with `WEDU` tokens.
contract EDUPair is Pair {
	/// @notice Fallback function to handle incoming EDU payments.
	receive() external payable {}
}

// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import { Pair, TokenPayment, AddLiquidityContext } from "./Pair.sol";
import { WEDU } from "../common/libs/WEDU.sol";
import { TransparentUpgradeableProxy } from "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";

library DeployEduPair {
	/// @notice Deploys a new instance of the `EDUPair` contract using an upgradeable proxy.
	/// @param basePairAddr The address of the base pair contract.
	/// @param proxyAdmin The address of the ProxyAdmin.
	/// @return A new instance of the `EDUPair` contract.
	function newEDUPair(
		address basePairAddr,
		address proxyAdmin
	) external returns (EDUPair) {
		// Deploy the implementation contract
		EDUPair eduPairImpl = new EDUPair();

		// Deploy the proxy and point it to the implementation
		TransparentUpgradeableProxy proxy = new TransparentUpgradeableProxy(
			address(eduPairImpl), // implementation address
			proxyAdmin, // admin for the proxy
			abi.encodeWithSignature("initialize(address)", basePairAddr) // initializer data
		);

		// Cast the proxy to the EDUPair type and return
		return EDUPair(payable(address(proxy)));
	}
}

/// @title EDUPair
/// @notice A specialized pair contract for handling EduChain (EDU) token trades.
/// @dev Inherits from the `Pair` contract and customizes it to work specifically with `WEDU` tokens.
contract EDUPair is Pair {
	/// @notice Initializes the EDUPair contract with the base pair address.
	/// @param basePair The address of the base pair.
	function initialize(address basePair) public {
		initialize(address(0), basePair);
	}

	/// @notice Internal function to set the trade token as `WEDU`.
	/// @dev Overrides the `_setTradeToken` function from the `Pair` contract to use `WEDU`.
	/// @param tradeToken_ The address of the trade token.
	/// @dev A new instance of the `WEDU` contract is deployed and assigned as the trade token.
	function _setTradeToken(address tradeToken_) internal override {
		tradeToken = address(new WEDU());
	}

	/// @notice Fallback function to handle incoming EDU payments.
	receive() external payable {}
}

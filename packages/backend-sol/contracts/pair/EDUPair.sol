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
		address weduImpl = address(new WEDU());
		EDUPair eduPairImpl = new EDUPair();

		TransparentUpgradeableProxy weduProxy = new TransparentUpgradeableProxy(
			weduImpl,
			proxyAdmin,
			abi.encodeWithSignature("initialize()")
		);
		TransparentUpgradeableProxy eduPairProxy = new TransparentUpgradeableProxy(
			address(eduPairImpl), // implementation address
			proxyAdmin, // admin for the proxy
			abi.encodeWithSelector(
				Pair.initialize.selector,
				weduProxy,
				basePairAddr
			)
		);

		// Cast the proxy to the EDUPair type and return
		return EDUPair(payable(address(eduPairProxy)));
	}
}

/// @title EDUPair
/// @notice A specialized pair contract for handling EduChain (EDU) token trades.
/// @dev Inherits from the `Pair` contract and customizes it to work specifically with `WEDU` tokens.
contract EDUPair is Pair {
	/// @notice Fallback function to handle incoming EDU payments.
	receive() external payable {}
}

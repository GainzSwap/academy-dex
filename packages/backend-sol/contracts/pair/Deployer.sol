// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "./BasePair.sol";
import "./Pair.sol";
import "./EDUPair.sol";

/// @title DeployBasePair
/// @notice Library to deploy new instances of the `BasePair` contract.
library DeployBasePair {
	/// @notice Deploys a new instance of the `BasePair` contract.
	/// @dev Deploys a new `ADEX` token and passes its address to the `BasePair` contract.
	/// @return A new instance of the `BasePair` contract.
	function newBasePair(
		address proxyAdmin,
		address initialOwner
	) external returns (BasePair) {
		address adexImplementation = address(new ADEX());
		address basePairImpl = address(new BasePair());

		TransparentUpgradeableProxy adexProxy = new TransparentUpgradeableProxy(
			adexImplementation,
			proxyAdmin,
			abi.encodeWithSignature("initialize(address)", initialOwner)
		);
		TransparentUpgradeableProxy basePairProxy = new TransparentUpgradeableProxy(
				basePairImpl,
				proxyAdmin,
				abi.encodeWithSignature("initialize(address)", adexProxy)
			);

		return BasePair(address(basePairProxy));
	}
}

library DeployPair {
	function newPair(
		address pairbeacon,
		address tradeToken,
		address basePairAddr
	) external returns (Pair) {
		// Deploy the BeaconProxy and initialize it
		BeaconProxy proxy = new BeaconProxy(
			pairbeacon,
			abi.encodeWithSelector(
				Pair.initialize.selector,
				tradeToken,
				basePairAddr
			)
		);

		return (Pair(address(proxy)));
	}

	function deployPairBeacon(address proxyAdmin) external returns (address) {
		// Deploy the UpgradeableBeacon contract
		UpgradeableBeacon beacon = new UpgradeableBeacon(
			address(new Pair()),
			proxyAdmin
		);

		return address(beacon);
	}
}


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

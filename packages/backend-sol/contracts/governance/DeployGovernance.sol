// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import { Epochs } from "../common/Epochs.sol";
import { Governance } from "./Governance.sol";
import { TransparentUpgradeableProxy } from "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";

library DeployGovernance {
	function newGovernance(
		address lpToken,
		address adex,
		Epochs.Storage memory epochs,
		address router,
		address proxyAdmin
	) external returns (Governance) {
		address governanceImplementation = address(new Governance());
		address caller = msg.sender;

		// Get the owner address from the caller
		(bool success, bytes memory owner) = caller.call(
			abi.encodeWithSignature("owner()")
		);

		// Determine the feeCollector, use the owner if callable, else fallback to caller
		address feeCollector = success && owner.length > 0
			? abi.decode(owner, (address))
			: caller;

		// Deploy the TransparentUpgradeableProxy and initialize the Governance contract
		TransparentUpgradeableProxy proxy = new TransparentUpgradeableProxy(
			governanceImplementation,
			proxyAdmin,
			abi.encodeWithSelector(
				Governance.initialize.selector,
				lpToken,
				adex,
				epochs,
				feeCollector,
				router,
				proxyAdmin
			)
		);

		return Governance(payable(address(proxy)));
	}
}

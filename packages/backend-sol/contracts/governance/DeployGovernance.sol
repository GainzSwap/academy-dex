// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import { Epochs } from "../common/Epochs.sol";
import { Governance } from "./Governance.sol";

library DeployGovernance {
	function newGovernance(
		address lpToken,
		address adex,
		Epochs.Storage memory epochs
	) external returns (Governance) {
		address caller = msg.sender;
		(bool success, bytes memory owner) = caller.call(
			abi.encodeWithSignature("owner()")
		);

		address feeCollector = success && owner.length > 0
			? abi.decode(owner, (address))
			: caller;
		return new Governance(lpToken, adex, epochs, feeCollector);
	}
}

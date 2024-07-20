//SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "../../common/libs/Types.sol";

struct AddLiquidityResultType {
	ERC20TokenPayment lpPayment;
	ERC20TokenPayment firstTokenPayment;
	ERC20TokenPayment secondTokenPayment;
}

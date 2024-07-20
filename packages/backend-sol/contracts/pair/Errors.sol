//SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

error ErrorInvalidArgs();
error ErrorBadPaymentTokens();
error ErrorNotActive();

/// Initial liquidity was not added
error ErrorInitialLiquidityNotAdded();

/// The current safe price index of `currentIndex` is greater than the maximum number of observations `maxIndex`
/// @param currentIndex the current index
/// @param maxIndex the maximum possible index
error ErrorSafePriceCurrentIndex(uint currentIndex, uint maxIndex);

/// index out of range
error IndexOutOfRangeErrMsg();

/// K invariant failed
error ErrorKInvariantFailed();

/// Insufficient liquidity minted
error ErrorInsufficientLiquidity();

/// First tokens needs to be greater than minimum liquidity
error ErrorFirstLiquidity();

/// Optimal amount greater than desired amount
error ErrorOptimalGreaterThanPaid();

/// Insufficient first token computed amount
error ErrorInsufficientFirstToken();

/// Insufficient second token computed amount
error ErrorInsufficientSecondToken();

/// Permission denied
error ErrorPermissionDenied();

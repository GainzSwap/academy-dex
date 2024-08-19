/**
 * You should not edit it manually or your changes might be overwritten.
 */
import { GenericContractsDeclaration } from "~~/utils/scaffold-eth/contract";

const deployedContracts = {
  31337: {
    Pair: {
      address: "0x9E545E3C0baAB3E08CdfD552C960A1050f373042",
      abi: [
        {
          inputs: [
            {
              internalType: "address",
              name: "tradeToken_",
              type: "address",
            },
            {
              internalType: "address",
              name: "basePairAddr",
              type: "address",
            },
          ],
          stateMutability: "nonpayable",
          type: "constructor",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "currentIndex",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "maxIndex",
              type: "uint256",
            },
          ],
          name: "ErrorSafePriceCurrentIndex",
          type: "error",
        },
        {
          inputs: [],
          name: "IndexOutOfRangeErrMsg",
          type: "error",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "pair",
              type: "address",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "fee",
              type: "uint256",
            },
          ],
          name: "BurntFees",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "from",
              type: "address",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "amount",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "liqAdded",
              type: "uint256",
            },
          ],
          name: "LiquidityAdded",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "previousOwner",
              type: "address",
            },
            {
              indexed: true,
              internalType: "address",
              name: "newOwner",
              type: "address",
            },
          ],
          name: "OwnershipTransferred",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "from",
              type: "address",
            },
            {
              indexed: true,
              internalType: "address",
              name: "to",
              type: "address",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "amountIn",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "amountOut",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "fee",
              type: "uint256",
            },
          ],
          name: "SellExecuted",
          type: "event",
        },
        {
          inputs: [
            {
              components: [
                {
                  internalType: "contract IERC20",
                  name: "token",
                  type: "address",
                },
                {
                  internalType: "uint256",
                  name: "amount",
                  type: "uint256",
                },
              ],
              internalType: "struct ERC20TokenPayment",
              name: "wholePayment",
              type: "tuple",
            },
            {
              internalType: "address",
              name: "from",
              type: "address",
            },
          ],
          name: "addLiquidity",
          outputs: [
            {
              internalType: "uint256",
              name: "liqAdded",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "rps",
              type: "uint256",
            },
          ],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "deposits",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "lpSupply",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "owner",
          outputs: [
            {
              internalType: "address",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              components: [
                {
                  internalType: "uint256",
                  name: "nonce",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "amount",
                  type: "uint256",
                },
                {
                  components: [
                    {
                      internalType: "uint256",
                      name: "rewardPerShare",
                      type: "uint256",
                    },
                    {
                      internalType: "uint256",
                      name: "depValuePerShare",
                      type: "uint256",
                    },
                    {
                      internalType: "address",
                      name: "pair",
                      type: "address",
                    },
                  ],
                  internalType: "struct LpToken.LpAttributes",
                  name: "attributes",
                  type: "tuple",
                },
              ],
              internalType: "struct LpToken.LpBalance",
              name: "liquidity",
              type: "tuple",
            },
            {
              internalType: "uint256",
              name: "liqToRemove",
              type: "uint256",
            },
            {
              internalType: "address",
              name: "from",
              type: "address",
            },
          ],
          name: "removeLiquidity",
          outputs: [
            {
              components: [
                {
                  internalType: "uint256",
                  name: "nonce",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "amount",
                  type: "uint256",
                },
                {
                  components: [
                    {
                      internalType: "uint256",
                      name: "rewardPerShare",
                      type: "uint256",
                    },
                    {
                      internalType: "uint256",
                      name: "depValuePerShare",
                      type: "uint256",
                    },
                    {
                      internalType: "address",
                      name: "pair",
                      type: "address",
                    },
                  ],
                  internalType: "struct LpToken.LpAttributes",
                  name: "attributes",
                  type: "tuple",
                },
              ],
              internalType: "struct LpToken.LpBalance",
              name: "",
              type: "tuple",
            },
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "renounceOwnership",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "reserve",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "sales",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "caller",
              type: "address",
            },
            {
              internalType: "address",
              name: "referrerOfCaller",
              type: "address",
            },
            {
              components: [
                {
                  internalType: "contract IERC20",
                  name: "token",
                  type: "address",
                },
                {
                  internalType: "uint256",
                  name: "amount",
                  type: "uint256",
                },
              ],
              internalType: "struct ERC20TokenPayment",
              name: "inPayment",
              type: "tuple",
            },
            {
              internalType: "contract Pair",
              name: "outPair",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "slippage",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "totalFeePercent",
              type: "uint256",
            },
          ],
          name: "sell",
          outputs: [
            {
              internalType: "uint256",
              name: "burntFee",
              type: "uint256",
            },
          ],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "receiver",
              type: "address",
            },
            {
              internalType: "address",
              name: "referrer",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "amount",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "totalFeePercent",
              type: "uint256",
            },
          ],
          name: "takeFeesAndTransferTokens",
          outputs: [
            {
              internalType: "uint256",
              name: "amountOut",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "toBurn",
              type: "uint256",
            },
          ],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "tradeToken",
          outputs: [
            {
              internalType: "contract ERC20",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "newOwner",
              type: "address",
            },
          ],
          name: "transferOwnership",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
      ],
      inheritedFunctions: {
        owner: "@openzeppelin/contracts/access/Ownable.sol",
        renounceOwnership: "@openzeppelin/contracts/access/Ownable.sol",
        transferOwnership: "@openzeppelin/contracts/access/Ownable.sol",
      },
    },
    Router: {
      address: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
      abi: [
        {
          inputs: [],
          stateMutability: "nonpayable",
          type: "constructor",
        },
        {
          inputs: [
            {
              internalType: "int256",
              name: "x",
              type: "int256",
            },
          ],
          name: "PRBMathSD59x18__Exp2InputTooBig",
          type: "error",
        },
        {
          inputs: [
            {
              internalType: "int256",
              name: "x",
              type: "int256",
            },
          ],
          name: "PRBMathSD59x18__LogInputTooSmall",
          type: "error",
        },
        {
          inputs: [],
          name: "PRBMathSD59x18__MulInputTooSmall",
          type: "error",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "rAbs",
              type: "uint256",
            },
          ],
          name: "PRBMathSD59x18__MulOverflow",
          type: "error",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "prod1",
              type: "uint256",
            },
          ],
          name: "PRBMath__MulDivFixedPointOverflow",
          type: "error",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "number",
              type: "uint256",
            },
          ],
          name: "ToInt256CastOverflow",
          type: "error",
        },
        {
          inputs: [
            {
              internalType: "int256",
              name: "number",
              type: "int256",
            },
          ],
          name: "ToUint256CastOverflow",
          type: "error",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "user",
              type: "address",
            },
            {
              indexed: true,
              internalType: "address",
              name: "pair",
              type: "address",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "liquidityRemoved",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "tradeTokenAmount",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "baseTokenAmount",
              type: "uint256",
            },
          ],
          name: "LiquidityRemoved",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "previousOwner",
              type: "address",
            },
            {
              indexed: true,
              internalType: "address",
              name: "newOwner",
              type: "address",
            },
          ],
          name: "OwnershipTransferred",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: false,
              internalType: "uint256",
              name: "referrerId",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "referralId",
              type: "uint256",
            },
          ],
          name: "ReferralAdded",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: false,
              internalType: "uint256",
              name: "userId",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "address",
              name: "userAddress",
              type: "address",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "referrerId",
              type: "uint256",
            },
          ],
          name: "UserRegistered",
          type: "event",
        },
        {
          inputs: [
            {
              components: [
                {
                  internalType: "contract IERC20",
                  name: "token",
                  type: "address",
                },
                {
                  internalType: "uint256",
                  name: "amount",
                  type: "uint256",
                },
              ],
              internalType: "struct ERC20TokenPayment",
              name: "wholePayment",
              type: "tuple",
            },
          ],
          name: "addLiquidity",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "basePairAddr",
          outputs: [
            {
              internalType: "address",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256[]",
              name: "nonces",
              type: "uint256[]",
            },
          ],
          name: "claimRewards",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "pairAddress",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "inAmount",
              type: "uint256",
            },
          ],
          name: "computeFeePercent",
          outputs: [
            {
              internalType: "uint256",
              name: "feePercent",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "tradeToken",
              type: "address",
            },
          ],
          name: "createPair",
          outputs: [
            {
              internalType: "contract Pair",
              name: "pair",
              type: "address",
            },
          ],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "inPair",
              type: "address",
            },
            {
              internalType: "address",
              name: "outPair",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "inAmount",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "slippage",
              type: "uint256",
            },
          ],
          name: "estimateOutAmount",
          outputs: [
            {
              internalType: "uint256",
              name: "amountOut",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "getAllPairs",
          outputs: [
            {
              internalType: "address[]",
              name: "",
              type: "address[]",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "user",
              type: "address",
            },
          ],
          name: "getClaimableRewards",
          outputs: [
            {
              internalType: "uint256",
              name: "totalClaimable",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "userAddress",
              type: "address",
            },
          ],
          name: "getReferrer",
          outputs: [
            {
              internalType: "uint256",
              name: "referrerId",
              type: "uint256",
            },
            {
              internalType: "address",
              name: "referrerAddress",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "userAddress",
              type: "address",
            },
          ],
          name: "getUserId",
          outputs: [
            {
              internalType: "uint256",
              name: "userId",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "globalData",
          outputs: [
            {
              internalType: "uint256",
              name: "totalLiq",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "rewardsReserve",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "rewardsPerShare",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "totalTradeVolume",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "lastTimestamp",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "lpToken",
          outputs: [
            {
              internalType: "contract LpToken",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "owner",
          outputs: [
            {
              internalType: "address",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "pairsCount",
          outputs: [
            {
              internalType: "uint64",
              name: "",
              type: "uint64",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "",
              type: "address",
            },
          ],
          name: "pairsData",
          outputs: [
            {
              internalType: "uint256",
              name: "sellVolume",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "buyVolume",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "lpRewardsPershare",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "tradeRewardsPershare",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "totalLiq",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "rewardsReserve",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "referrerId",
              type: "uint256",
            },
            {
              components: [
                {
                  internalType: "contract IERC20",
                  name: "token",
                  type: "address",
                },
                {
                  internalType: "uint256",
                  name: "amount",
                  type: "uint256",
                },
              ],
              internalType: "struct ERC20TokenPayment",
              name: "inPayment",
              type: "tuple",
            },
            {
              internalType: "address",
              name: "outPairAddr",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "slippage",
              type: "uint256",
            },
          ],
          name: "registerAndSwap",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "nonce",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "liqRemoval",
              type: "uint256",
            },
          ],
          name: "removeLiquidity",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "renounceOwnership",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              components: [
                {
                  internalType: "contract IERC20",
                  name: "token",
                  type: "address",
                },
                {
                  internalType: "uint256",
                  name: "amount",
                  type: "uint256",
                },
              ],
              internalType: "struct ERC20TokenPayment",
              name: "inPayment",
              type: "tuple",
            },
            {
              internalType: "address",
              name: "outPairAddr",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "slippage",
              type: "uint256",
            },
          ],
          name: "swap",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "",
              type: "address",
            },
          ],
          name: "tokensPairAddress",
          outputs: [
            {
              internalType: "address",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "tradeableTokens",
          outputs: [
            {
              internalType: "address[]",
              name: "",
              type: "address[]",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "newOwner",
              type: "address",
            },
          ],
          name: "transferOwnership",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "userCount",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          name: "userIdToAddress",
          outputs: [
            {
              internalType: "address",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "",
              type: "address",
            },
          ],
          name: "users",
          outputs: [
            {
              internalType: "uint256",
              name: "id",
              type: "uint256",
            },
            {
              internalType: "address",
              name: "addr",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "referrerId",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
      ],
      inheritedFunctions: {
        owner: "@openzeppelin/contracts/access/Ownable.sol",
        renounceOwnership: "@openzeppelin/contracts/access/Ownable.sol",
        transferOwnership: "@openzeppelin/contracts/access/Ownable.sol",
      },
    },
  },
  656476: {
    Pair: {
      address: "0x327FB1F18359B530877be28486c87C325C369f73",
      abi: [
        {
          inputs: [
            {
              internalType: "address",
              name: "tradeToken_",
              type: "address",
            },
            {
              internalType: "address",
              name: "basePairAddr",
              type: "address",
            },
          ],
          stateMutability: "nonpayable",
          type: "constructor",
        },
        {
          inputs: [],
          name: "ErrorKInvariantFailed",
          type: "error",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "currentIndex",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "maxIndex",
              type: "uint256",
            },
          ],
          name: "ErrorSafePriceCurrentIndex",
          type: "error",
        },
        {
          inputs: [],
          name: "IndexOutOfRangeErrMsg",
          type: "error",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "user",
              type: "address",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "balance",
              type: "uint256",
            },
          ],
          name: "BalanceUpdated",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "from",
              type: "address",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "amount",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "liqAdded",
              type: "uint256",
            },
          ],
          name: "LiquidityAdded",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "previousOwner",
              type: "address",
            },
            {
              indexed: true,
              internalType: "address",
              name: "newOwner",
              type: "address",
            },
          ],
          name: "OwnershipTransferred",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "from",
              type: "address",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "amount",
              type: "uint256",
            },
          ],
          name: "RewardReceived",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "from",
              type: "address",
            },
            {
              indexed: true,
              internalType: "address",
              name: "to",
              type: "address",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "amountIn",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "amountOut",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "fee",
              type: "uint256",
            },
          ],
          name: "SellExecuted",
          type: "event",
        },
        {
          inputs: [
            {
              components: [
                {
                  internalType: "contract IERC20",
                  name: "token",
                  type: "address",
                },
                {
                  internalType: "uint256",
                  name: "amount",
                  type: "uint256",
                },
              ],
              internalType: "struct ERC20TokenPayment",
              name: "wholePayment",
              type: "tuple",
            },
            {
              internalType: "address",
              name: "from",
              type: "address",
            },
          ],
          name: "addLiquidity",
          outputs: [
            {
              internalType: "uint256",
              name: "liqAdded",
              type: "uint256",
            },
          ],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "to",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "amount",
              type: "uint256",
            },
          ],
          name: "completeSell",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "deposits",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "lpSupply",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "owner",
          outputs: [
            {
              internalType: "address",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              components: [
                {
                  internalType: "contract IERC20",
                  name: "token",
                  type: "address",
                },
                {
                  internalType: "uint256",
                  name: "amount",
                  type: "uint256",
                },
              ],
              internalType: "struct ERC20TokenPayment",
              name: "payment",
              type: "tuple",
            },
          ],
          name: "receiveReward",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "renounceOwnership",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "reserve",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "rewards",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "sales",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "caller",
              type: "address",
            },
            {
              internalType: "address",
              name: "referrerOfCaller",
              type: "address",
            },
            {
              components: [
                {
                  internalType: "contract IERC20",
                  name: "token",
                  type: "address",
                },
                {
                  internalType: "uint256",
                  name: "amount",
                  type: "uint256",
                },
              ],
              internalType: "struct ERC20TokenPayment",
              name: "inPayment",
              type: "tuple",
            },
            {
              internalType: "contract Pair",
              name: "outPair",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "slippage",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "totalFeePercent",
              type: "uint256",
            },
          ],
          name: "sell",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "referrer",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "amount",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "totalFeePercent",
              type: "uint256",
            },
          ],
          name: "takeFees",
          outputs: [
            {
              internalType: "uint256",
              name: "amountOut",
              type: "uint256",
            },
          ],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "tradeToken",
          outputs: [
            {
              internalType: "contract ERC20",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "newOwner",
              type: "address",
            },
          ],
          name: "transferOwnership",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
      ],
      inheritedFunctions: {
        owner: "@openzeppelin/contracts/access/Ownable.sol",
        renounceOwnership: "@openzeppelin/contracts/access/Ownable.sol",
        transferOwnership: "@openzeppelin/contracts/access/Ownable.sol",
      },
    },
    Router: {
      address: "0x11cC66cD66b72b147F62155921FaCf111fB6042D",
      abi: [
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "previousOwner",
              type: "address",
            },
            {
              indexed: true,
              internalType: "address",
              name: "newOwner",
              type: "address",
            },
          ],
          name: "OwnershipTransferred",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: false,
              internalType: "uint256",
              name: "referrerId",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "referralId",
              type: "uint256",
            },
          ],
          name: "ReferralAdded",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: false,
              internalType: "uint256",
              name: "userId",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "address",
              name: "userAddress",
              type: "address",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "referrerId",
              type: "uint256",
            },
          ],
          name: "UserRegistered",
          type: "event",
        },
        {
          inputs: [
            {
              components: [
                {
                  internalType: "contract IERC20",
                  name: "token",
                  type: "address",
                },
                {
                  internalType: "uint256",
                  name: "amount",
                  type: "uint256",
                },
              ],
              internalType: "struct ERC20TokenPayment",
              name: "wholePayment",
              type: "tuple",
            },
          ],
          name: "addLiquidity",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "basePairAddr",
          outputs: [
            {
              internalType: "address",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "pairAddress",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "inAmount",
              type: "uint256",
            },
          ],
          name: "computeFeePercent",
          outputs: [
            {
              internalType: "uint256",
              name: "feePercent",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "tradeToken",
              type: "address",
            },
          ],
          name: "createPair",
          outputs: [
            {
              internalType: "contract Pair",
              name: "pair",
              type: "address",
            },
          ],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "inPair",
              type: "address",
            },
            {
              internalType: "address",
              name: "outPair",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "inAmount",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "slippage",
              type: "uint256",
            },
          ],
          name: "estimateOutAmount",
          outputs: [
            {
              internalType: "uint256",
              name: "amountOut",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "getAllPairs",
          outputs: [
            {
              internalType: "address[]",
              name: "",
              type: "address[]",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "userAddress",
              type: "address",
            },
          ],
          name: "getReferrer",
          outputs: [
            {
              internalType: "uint256",
              name: "referrerId",
              type: "uint256",
            },
            {
              internalType: "address",
              name: "referrerAddress",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "userAddress",
              type: "address",
            },
          ],
          name: "getUserId",
          outputs: [
            {
              internalType: "uint256",
              name: "userId",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "amount",
              type: "uint256",
            },
          ],
          name: "mintInitialSupply",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "owner",
          outputs: [
            {
              internalType: "address",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "",
              type: "address",
            },
          ],
          name: "pairData",
          outputs: [
            {
              internalType: "uint256",
              name: "rewardsAgainst",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "rewardsFor",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "totalLiq",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "pairsCount",
          outputs: [
            {
              internalType: "uint64",
              name: "",
              type: "uint64",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "referrerId",
              type: "uint256",
            },
            {
              components: [
                {
                  internalType: "contract IERC20",
                  name: "token",
                  type: "address",
                },
                {
                  internalType: "uint256",
                  name: "amount",
                  type: "uint256",
                },
              ],
              internalType: "struct ERC20TokenPayment",
              name: "inPayment",
              type: "tuple",
            },
            {
              internalType: "address",
              name: "outPairAddr",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "slippage",
              type: "uint256",
            },
          ],
          name: "registerAndSwap",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "renounceOwnership",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              components: [
                {
                  internalType: "contract IERC20",
                  name: "token",
                  type: "address",
                },
                {
                  internalType: "uint256",
                  name: "amount",
                  type: "uint256",
                },
              ],
              internalType: "struct ERC20TokenPayment",
              name: "inPayment",
              type: "tuple",
            },
            {
              internalType: "address",
              name: "outPairAddr",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "slippage",
              type: "uint256",
            },
          ],
          name: "swap",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "",
              type: "address",
            },
          ],
          name: "tokensPairAddress",
          outputs: [
            {
              internalType: "address",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "tradeableTokens",
          outputs: [
            {
              internalType: "address[]",
              name: "",
              type: "address[]",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "newOwner",
              type: "address",
            },
          ],
          name: "transferOwnership",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "userCount",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          name: "userIdToAddress",
          outputs: [
            {
              internalType: "address",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "",
              type: "address",
            },
          ],
          name: "users",
          outputs: [
            {
              internalType: "uint256",
              name: "id",
              type: "uint256",
            },
            {
              internalType: "address",
              name: "addr",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "referrerId",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
      ],
      inheritedFunctions: {
        owner: "@openzeppelin/contracts/access/Ownable.sol",
        renounceOwnership: "@openzeppelin/contracts/access/Ownable.sol",
        transferOwnership: "@openzeppelin/contracts/access/Ownable.sol",
      },
    },
  },
} as const;

export default deployedContracts satisfies GenericContractsDeclaration;

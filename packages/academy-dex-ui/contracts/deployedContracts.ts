/**
 * You should not edit it manually or your changes might be overwritten.
 */
import { GenericContractsDeclaration } from "~~/utils/scaffold-eth/contract";

const deployedContracts = {
  31337: {
    Pair: {
      address: "0x8A791620dd6260079BF849Dc5567aDC3F2FdC318",
      abi: [
        {
          inputs: [
            {
              internalType: "address",
              name: "firstToken_",
              type: "address",
            },
            {
              internalType: "address",
              name: "secondToken_",
              type: "address",
            },
            {
              internalType: "address",
              name: "routerAddress_",
              type: "address",
            },
            {
              internalType: "address",
              name: "routerOwnerAddress",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "totalFeePercent_",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "specialFeePercent_",
              type: "uint256",
            },
            {
              internalType: "address",
              name: "initialLiquidityAdder_",
              type: "address",
            },
          ],
          stateMutability: "nonpayable",
          type: "constructor",
        },
        {
          inputs: [],
          name: "ErrorBadPaymentTokens",
          type: "error",
        },
        {
          inputs: [],
          name: "ErrorBadPercents",
          type: "error",
        },
        {
          inputs: [],
          name: "ErrorFirstLiquidity",
          type: "error",
        },
        {
          inputs: [],
          name: "ErrorInitialLiquidityNotAdded",
          type: "error",
        },
        {
          inputs: [],
          name: "ErrorInsufficientFirstToken",
          type: "error",
        },
        {
          inputs: [],
          name: "ErrorInsufficientLiquidity",
          type: "error",
        },
        {
          inputs: [],
          name: "ErrorInsufficientLiquidityBurned",
          type: "error",
        },
        {
          inputs: [],
          name: "ErrorInsufficientSecondToken",
          type: "error",
        },
        {
          inputs: [],
          name: "ErrorInvalidArgs",
          type: "error",
        },
        {
          inputs: [],
          name: "ErrorKInvariantFailed",
          type: "error",
        },
        {
          inputs: [],
          name: "ErrorNotActive",
          type: "error",
        },
        {
          inputs: [],
          name: "ErrorNotEnoughLp",
          type: "error",
        },
        {
          inputs: [],
          name: "ErrorNotEnoughReserve",
          type: "error",
        },
        {
          inputs: [],
          name: "ErrorOptimalGreaterThanPaid",
          type: "error",
        },
        {
          inputs: [],
          name: "ErrorPermissionDenied",
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
          name: "ErrorSameTokens",
          type: "error",
        },
        {
          inputs: [],
          name: "ErrorSlippageOnRemove",
          type: "error",
        },
        {
          inputs: [],
          name: "IndexOutOfRangeErrMsg",
          type: "error",
        },
        {
          inputs: [],
          name: "InvalidTokenAddress",
          type: "error",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "firstToken",
              type: "address",
            },
            {
              indexed: true,
              internalType: "address",
              name: "secondToken",
              type: "address",
            },
            {
              indexed: true,
              internalType: "address",
              name: "caller",
              type: "address",
            },
            {
              components: [
                {
                  internalType: "address",
                  name: "caller",
                  type: "address",
                },
                {
                  internalType: "address",
                  name: "firstTokenId",
                  type: "address",
                },
                {
                  internalType: "uint256",
                  name: "firstTokenAmount",
                  type: "uint256",
                },
                {
                  internalType: "address",
                  name: "secondTokenId",
                  type: "address",
                },
                {
                  internalType: "uint256",
                  name: "secondTokenAmount",
                  type: "uint256",
                },
                {
                  internalType: "address",
                  name: "lpTokenId",
                  type: "address",
                },
                {
                  internalType: "uint256",
                  name: "lpTokenAmount",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "lpSupply",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "firstTokenReserves",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "secondTokenReserves",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "block",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "timestamp",
                  type: "uint256",
                },
              ],
              indexed: false,
              internalType: "struct AddLiquidityUtil.AddLiquidityEvent",
              name: "addLiquidityEvent",
              type: "tuple",
            },
          ],
          name: "AddLiquidity",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "bytes32",
              name: "role",
              type: "bytes32",
            },
            {
              indexed: true,
              internalType: "bytes32",
              name: "previousAdminRole",
              type: "bytes32",
            },
            {
              indexed: true,
              internalType: "bytes32",
              name: "newAdminRole",
              type: "bytes32",
            },
          ],
          name: "RoleAdminChanged",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "bytes32",
              name: "role",
              type: "bytes32",
            },
            {
              indexed: true,
              internalType: "address",
              name: "account",
              type: "address",
            },
            {
              indexed: true,
              internalType: "address",
              name: "sender",
              type: "address",
            },
          ],
          name: "RoleGranted",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "bytes32",
              name: "role",
              type: "bytes32",
            },
            {
              indexed: true,
              internalType: "address",
              name: "account",
              type: "address",
            },
            {
              indexed: true,
              internalType: "address",
              name: "sender",
              type: "address",
            },
          ],
          name: "RoleRevoked",
          type: "event",
        },
        {
          inputs: [],
          name: "DEFAULT_ADMIN_ROLE",
          outputs: [
            {
              internalType: "bytes32",
              name: "",
              type: "bytes32",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "firstTokenAmountMin",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "secondTokenAmountMin",
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
              name: "firstPayment",
              type: "tuple",
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
              name: "secondPayment",
              type: "tuple",
            },
          ],
          name: "addLiquidity",
          outputs: [
            {
              components: [
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
                  name: "lpPayment",
                  type: "tuple",
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
                  name: "firstTokenPayment",
                  type: "tuple",
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
                  name: "secondTokenPayment",
                  type: "tuple",
                },
              ],
              internalType: "struct AddLiquidityResultType",
              name: "output",
              type: "tuple",
            },
          ],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "firstToken",
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
              internalType: "bytes32",
              name: "role",
              type: "bytes32",
            },
          ],
          name: "getRoleAdmin",
          outputs: [
            {
              internalType: "bytes32",
              name: "",
              type: "bytes32",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "bytes32",
              name: "role",
              type: "bytes32",
            },
            {
              internalType: "address",
              name: "account",
              type: "address",
            },
          ],
          name: "grantRole",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "bytes32",
              name: "role",
              type: "bytes32",
            },
            {
              internalType: "address",
              name: "account",
              type: "address",
            },
          ],
          name: "hasRole",
          outputs: [
            {
              internalType: "bool",
              name: "",
              type: "bool",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "lpAddress",
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
              name: "user",
              type: "address",
            },
          ],
          name: "lpTokenBalanceOf",
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
              name: "firstTokenAmountMin",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "secondTokenAmountMin",
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
              name: "payment",
              type: "tuple",
            },
          ],
          name: "removeLiquidity",
          outputs: [
            {
              components: [
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
                  name: "firstTokenPayment",
                  type: "tuple",
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
                  name: "secondTokenPayment",
                  type: "tuple",
                },
              ],
              internalType: "struct RemoveLiquidityResultType",
              name: "",
              type: "tuple",
            },
          ],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "bytes32",
              name: "role",
              type: "bytes32",
            },
            {
              internalType: "address",
              name: "account",
              type: "address",
            },
          ],
          name: "renounceRole",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "resume",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "bytes32",
              name: "role",
              type: "bytes32",
            },
            {
              internalType: "address",
              name: "account",
              type: "address",
            },
          ],
          name: "revokeRole",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "secondToken",
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
          inputs: [],
          name: "state",
          outputs: [
            {
              internalType: "enum State",
              name: "",
              type: "uint8",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "bytes4",
              name: "interfaceId",
              type: "bytes4",
            },
          ],
          name: "supportsInterface",
          outputs: [
            {
              internalType: "bool",
              name: "",
              type: "bool",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
      ],
      inheritedFunctions: {
        firstToken: "contracts/pair/ConfigModule.sol",
        lpAddress: "contracts/pair/ConfigModule.sol",
        lpTokenBalanceOf: "contracts/pair/ConfigModule.sol",
        secondToken: "contracts/pair/ConfigModule.sol",
        DEFAULT_ADMIN_ROLE: "contracts/common/modules/PausableModule.sol",
        getRoleAdmin: "contracts/common/modules/PausableModule.sol",
        grantRole: "contracts/common/modules/PausableModule.sol",
        hasRole: "contracts/common/modules/PausableModule.sol",
        renounceRole: "contracts/common/modules/PausableModule.sol",
        resume: "contracts/common/modules/PausableModule.sol",
        revokeRole: "contracts/common/modules/PausableModule.sol",
        state: "contracts/common/modules/PausableModule.sol",
        supportsInterface: "contracts/common/modules/PausableModule.sol",
      },
    },
  },
} as const;

export default deployedContracts satisfies GenericContractsDeclaration;

/**
 * You should not edit it manually or your changes might be overwritten.
 */
import { GenericContractsDeclaration } from "~~/utils/scaffold-eth/contract";

const deployedContracts = {
  656476: {
    Pair: {
      address: "0xDB2F57a2F86EB603C86f19BbD80ecEa15b67a98E",
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
              internalType: "struct AddLiquidityModule.AddLiquidityEvent",
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
              internalType: "address",
              name: "owner",
              type: "address",
            },
            {
              indexed: true,
              internalType: "address",
              name: "spender",
              type: "address",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "value",
              type: "uint256",
            },
          ],
          name: "Approval",
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
              name: "value",
              type: "uint256",
            },
          ],
          name: "Transfer",
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
                  internalType: "address",
                  name: "tokenAddress",
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
                  internalType: "address",
                  name: "tokenAddress",
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
                      internalType: "address",
                      name: "tokenAddress",
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
                      internalType: "address",
                      name: "tokenAddress",
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
                      internalType: "address",
                      name: "tokenAddress",
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
          inputs: [
            {
              internalType: "address",
              name: "owner",
              type: "address",
            },
            {
              internalType: "address",
              name: "spender",
              type: "address",
            },
          ],
          name: "allowance",
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
              name: "spender",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "amount",
              type: "uint256",
            },
          ],
          name: "approve",
          outputs: [
            {
              internalType: "bool",
              name: "",
              type: "bool",
            },
          ],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "account",
              type: "address",
            },
          ],
          name: "balanceOf",
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
          name: "decimals",
          outputs: [
            {
              internalType: "uint8",
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
              internalType: "address",
              name: "spender",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "subtractedValue",
              type: "uint256",
            },
          ],
          name: "decreaseAllowance",
          outputs: [
            {
              internalType: "bool",
              name: "",
              type: "bool",
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
          inputs: [
            {
              internalType: "address",
              name: "spender",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "addedValue",
              type: "uint256",
            },
          ],
          name: "increaseAllowance",
          outputs: [
            {
              internalType: "bool",
              name: "",
              type: "bool",
            },
          ],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "name",
          outputs: [
            {
              internalType: "string",
              name: "",
              type: "string",
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
        {
          inputs: [],
          name: "symbol",
          outputs: [
            {
              internalType: "string",
              name: "",
              type: "string",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "totalSupply",
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
              name: "to",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "amount",
              type: "uint256",
            },
          ],
          name: "transfer",
          outputs: [
            {
              internalType: "bool",
              name: "",
              type: "bool",
            },
          ],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "from",
              type: "address",
            },
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
          name: "transferFrom",
          outputs: [
            {
              internalType: "bool",
              name: "",
              type: "bool",
            },
          ],
          stateMutability: "nonpayable",
          type: "function",
        },
      ],
      inheritedFunctions: {
        firstToken: "contracts/pair/pair_actions/AddLiquidityModule.sol",
        secondToken: "contracts/pair/pair_actions/AddLiquidityModule.sol",
        DEFAULT_ADMIN_ROLE:
          "contracts/pair/pair_actions/AddLiquidityModule.sol",
        getRoleAdmin: "contracts/pair/pair_actions/AddLiquidityModule.sol",
        grantRole: "contracts/pair/pair_actions/AddLiquidityModule.sol",
        hasRole: "contracts/pair/pair_actions/AddLiquidityModule.sol",
        renounceRole: "contracts/pair/pair_actions/AddLiquidityModule.sol",
        resume: "contracts/pair/pair_actions/AddLiquidityModule.sol",
        revokeRole: "contracts/pair/pair_actions/AddLiquidityModule.sol",
        state: "contracts/pair/pair_actions/AddLiquidityModule.sol",
        supportsInterface: "contracts/pair/pair_actions/AddLiquidityModule.sol",
        addLiquidity: "contracts/pair/pair_actions/AddLiquidityModule.sol",
        allowance: "contracts/pair/pair_actions/AddLiquidityModule.sol",
        approve: "contracts/pair/pair_actions/AddLiquidityModule.sol",
        balanceOf: "contracts/pair/pair_actions/AddLiquidityModule.sol",
        decimals: "contracts/pair/pair_actions/AddLiquidityModule.sol",
        decreaseAllowance: "contracts/pair/pair_actions/AddLiquidityModule.sol",
        increaseAllowance: "contracts/pair/pair_actions/AddLiquidityModule.sol",
        name: "contracts/pair/pair_actions/AddLiquidityModule.sol",
        symbol: "contracts/pair/pair_actions/AddLiquidityModule.sol",
        totalSupply: "contracts/pair/pair_actions/AddLiquidityModule.sol",
        transfer: "contracts/pair/pair_actions/AddLiquidityModule.sol",
        transferFrom: "contracts/pair/pair_actions/AddLiquidityModule.sol",
      },
    },
    TestingERC20: {
      address: "0x0a80fd491b72d3170c3163420B73E6A2d3835B5e",
      abi: [
        {
          inputs: [
            {
              internalType: "string",
              name: "name_",
              type: "string",
            },
            {
              internalType: "string",
              name: "symbol_",
              type: "string",
            },
          ],
          stateMutability: "nonpayable",
          type: "constructor",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "owner",
              type: "address",
            },
            {
              indexed: true,
              internalType: "address",
              name: "spender",
              type: "address",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "value",
              type: "uint256",
            },
          ],
          name: "Approval",
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
              name: "value",
              type: "uint256",
            },
          ],
          name: "Transfer",
          type: "event",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "owner",
              type: "address",
            },
            {
              internalType: "address",
              name: "spender",
              type: "address",
            },
          ],
          name: "allowance",
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
              name: "spender",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "amount",
              type: "uint256",
            },
          ],
          name: "approve",
          outputs: [
            {
              internalType: "bool",
              name: "",
              type: "bool",
            },
          ],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "account",
              type: "address",
            },
          ],
          name: "balanceOf",
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
          name: "decimals",
          outputs: [
            {
              internalType: "uint8",
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
              internalType: "address",
              name: "spender",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "subtractedValue",
              type: "uint256",
            },
          ],
          name: "decreaseAllowance",
          outputs: [
            {
              internalType: "bool",
              name: "",
              type: "bool",
            },
          ],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "spender",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "addedValue",
              type: "uint256",
            },
          ],
          name: "increaseAllowance",
          outputs: [
            {
              internalType: "bool",
              name: "",
              type: "bool",
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
              name: "amt",
              type: "uint256",
            },
          ],
          name: "mint",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "name",
          outputs: [
            {
              internalType: "string",
              name: "",
              type: "string",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "symbol",
          outputs: [
            {
              internalType: "string",
              name: "",
              type: "string",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "totalSupply",
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
              name: "to",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "amount",
              type: "uint256",
            },
          ],
          name: "transfer",
          outputs: [
            {
              internalType: "bool",
              name: "",
              type: "bool",
            },
          ],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "from",
              type: "address",
            },
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
          name: "transferFrom",
          outputs: [
            {
              internalType: "bool",
              name: "",
              type: "bool",
            },
          ],
          stateMutability: "nonpayable",
          type: "function",
        },
      ],
      inheritedFunctions: {
        allowance: "@openzeppelin/contracts/token/ERC20/ERC20.sol",
        approve: "@openzeppelin/contracts/token/ERC20/ERC20.sol",
        balanceOf: "@openzeppelin/contracts/token/ERC20/ERC20.sol",
        decimals: "@openzeppelin/contracts/token/ERC20/ERC20.sol",
        decreaseAllowance: "@openzeppelin/contracts/token/ERC20/ERC20.sol",
        increaseAllowance: "@openzeppelin/contracts/token/ERC20/ERC20.sol",
        name: "@openzeppelin/contracts/token/ERC20/ERC20.sol",
        symbol: "@openzeppelin/contracts/token/ERC20/ERC20.sol",
        totalSupply: "@openzeppelin/contracts/token/ERC20/ERC20.sol",
        transfer: "@openzeppelin/contracts/token/ERC20/ERC20.sol",
        transferFrom: "@openzeppelin/contracts/token/ERC20/ERC20.sol",
      },
    },
  },
} as const;

export default deployedContracts satisfies GenericContractsDeclaration;

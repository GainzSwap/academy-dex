/**
 * You should not edit it manually or your changes might be overwritten.
 */
import { GenericContractsDeclaration } from "~~/utils/scaffold-eth/contract";

const deployedContracts = {
  31337: {
    GTokens: {
      address: "0x1fD726d1d66454F3BF8Ee893e94D26daE9b577a1",
      abi: [
        {
          inputs: [
            {
              components: [
                {
                  internalType: "uint256",
                  name: "genesis",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "epochLength",
                  type: "uint256",
                },
              ],
              internalType: "struct Epochs.Storage",
              name: "epochs_",
              type: "tuple",
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
              name: "account",
              type: "address",
            },
            {
              indexed: true,
              internalType: "address",
              name: "operator",
              type: "address",
            },
            {
              indexed: false,
              internalType: "bool",
              name: "approved",
              type: "bool",
            },
          ],
          name: "ApprovalForAll",
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
              name: "operator",
              type: "address",
            },
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
              internalType: "uint256[]",
              name: "ids",
              type: "uint256[]",
            },
            {
              indexed: false,
              internalType: "uint256[]",
              name: "values",
              type: "uint256[]",
            },
          ],
          name: "TransferBatch",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "operator",
              type: "address",
            },
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
              name: "id",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "value",
              type: "uint256",
            },
          ],
          name: "TransferSingle",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: false,
              internalType: "string",
              name: "value",
              type: "string",
            },
            {
              indexed: true,
              internalType: "uint256",
              name: "id",
              type: "uint256",
            },
          ],
          name: "URI",
          type: "event",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "account",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "id",
              type: "uint256",
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
          inputs: [
            {
              internalType: "address[]",
              name: "accounts",
              type: "address[]",
            },
            {
              internalType: "uint256[]",
              name: "ids",
              type: "uint256[]",
            },
          ],
          name: "balanceOfBatch",
          outputs: [
            {
              internalType: "uint256[]",
              name: "",
              type: "uint256[]",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "epochs",
          outputs: [
            {
              internalType: "uint256",
              name: "genesis",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "epochLength",
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
              name: "user",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "nonce",
              type: "uint256",
            },
          ],
          name: "getBalanceAt",
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
                  internalType: "uint256",
                  name: "votePower",
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
                      name: "epochStaked",
                      type: "uint256",
                    },
                    {
                      internalType: "uint256",
                      name: "epochsLocked",
                      type: "uint256",
                    },
                    {
                      internalType: "uint256",
                      name: "lastClaimEpoch",
                      type: "uint256",
                    },
                    {
                      internalType: "uint256",
                      name: "lpAmount",
                      type: "uint256",
                    },
                    {
                      internalType: "uint256",
                      name: "stakeWeight",
                      type: "uint256",
                    },
                    {
                      components: [
                        {
                          internalType: "address",
                          name: "token",
                          type: "address",
                        },
                        {
                          internalType: "uint256",
                          name: "amount",
                          type: "uint256",
                        },
                        {
                          internalType: "uint256",
                          name: "nonce",
                          type: "uint256",
                        },
                      ],
                      internalType: "struct TokenPayment[]",
                      name: "lpPayments",
                      type: "tuple[]",
                    },
                  ],
                  internalType: "struct GToken.Attributes",
                  name: "attributes",
                  type: "tuple",
                },
              ],
              internalType: "struct GTokensBalance",
              name: "",
              type: "tuple",
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
          name: "getGTokenBalance",
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
                  internalType: "uint256",
                  name: "votePower",
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
                      name: "epochStaked",
                      type: "uint256",
                    },
                    {
                      internalType: "uint256",
                      name: "epochsLocked",
                      type: "uint256",
                    },
                    {
                      internalType: "uint256",
                      name: "lastClaimEpoch",
                      type: "uint256",
                    },
                    {
                      internalType: "uint256",
                      name: "lpAmount",
                      type: "uint256",
                    },
                    {
                      internalType: "uint256",
                      name: "stakeWeight",
                      type: "uint256",
                    },
                    {
                      components: [
                        {
                          internalType: "address",
                          name: "token",
                          type: "address",
                        },
                        {
                          internalType: "uint256",
                          name: "amount",
                          type: "uint256",
                        },
                        {
                          internalType: "uint256",
                          name: "nonce",
                          type: "uint256",
                        },
                      ],
                      internalType: "struct TokenPayment[]",
                      name: "lpPayments",
                      type: "tuple[]",
                    },
                  ],
                  internalType: "struct GToken.Attributes",
                  name: "attributes",
                  type: "tuple",
                },
              ],
              internalType: "struct GTokensBalance[]",
              name: "",
              type: "tuple[]",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "owner",
              type: "address",
            },
          ],
          name: "getNonces",
          outputs: [
            {
              internalType: "uint256[]",
              name: "",
              type: "uint256[]",
            },
          ],
          stateMutability: "view",
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
              internalType: "uint256",
              name: "nonce",
              type: "uint256",
            },
          ],
          name: "hasSFT",
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
              name: "account",
              type: "address",
            },
            {
              internalType: "address",
              name: "operator",
              type: "address",
            },
          ],
          name: "isApprovedForAll",
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
              name: "to",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "rewardPerShare",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "epochsLocked",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "lpAmount",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "currentEpoch",
              type: "uint256",
            },
            {
              components: [
                {
                  internalType: "address",
                  name: "token",
                  type: "address",
                },
                {
                  internalType: "uint256",
                  name: "amount",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "nonce",
                  type: "uint256",
                },
              ],
              internalType: "struct TokenPayment[]",
              name: "lpPayments",
              type: "tuple[]",
            },
          ],
          name: "mintGToken",
          outputs: [
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
          name: "renounceOwnership",
          outputs: [],
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
              internalType: "uint256[]",
              name: "ids",
              type: "uint256[]",
            },
            {
              internalType: "uint256[]",
              name: "amounts",
              type: "uint256[]",
            },
            {
              internalType: "bytes",
              name: "data",
              type: "bytes",
            },
          ],
          name: "safeBatchTransferFrom",
          outputs: [],
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
              name: "id",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "amount",
              type: "uint256",
            },
            {
              internalType: "bytes",
              name: "data",
              type: "bytes",
            },
          ],
          name: "safeTransferFrom",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "operator",
              type: "address",
            },
            {
              internalType: "bool",
              name: "approved",
              type: "bool",
            },
          ],
          name: "setApprovalForAll",
          outputs: [],
          stateMutability: "nonpayable",
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
          name: "tokenInfo",
          outputs: [
            {
              internalType: "string",
              name: "",
              type: "string",
            },
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
          name: "totalLpAmount",
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
          name: "totalStakeWeight",
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
          inputs: [
            {
              internalType: "address",
              name: "user",
              type: "address",
            },
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
                  name: "epochStaked",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "epochsLocked",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "lastClaimEpoch",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "lpAmount",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "stakeWeight",
                  type: "uint256",
                },
                {
                  components: [
                    {
                      internalType: "address",
                      name: "token",
                      type: "address",
                    },
                    {
                      internalType: "uint256",
                      name: "amount",
                      type: "uint256",
                    },
                    {
                      internalType: "uint256",
                      name: "nonce",
                      type: "uint256",
                    },
                  ],
                  internalType: "struct TokenPayment[]",
                  name: "lpPayments",
                  type: "tuple[]",
                },
              ],
              internalType: "struct GToken.Attributes",
              name: "attr",
              type: "tuple",
            },
          ],
          name: "update",
          outputs: [
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
          inputs: [
            {
              internalType: "address",
              name: "user",
              type: "address",
            },
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
              internalType: "bytes",
              name: "attr",
              type: "bytes",
            },
          ],
          name: "update",
          outputs: [
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
          inputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          name: "uri",
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
      ],
      inheritedFunctions: {},
    },
    Governance: {
      address: "0xfF33dAF08339Ab237EB75598bf65843FBF25047D",
      abi: [
        {
          inputs: [
            {
              internalType: "address",
              name: "_lpToken",
              type: "address",
            },
            {
              internalType: "address",
              name: "_adex",
              type: "address",
            },
            {
              components: [
                {
                  internalType: "uint256",
                  name: "genesis",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "epochLength",
                  type: "uint256",
                },
              ],
              internalType: "struct Epochs.Storage",
              name: "epochs_",
              type: "tuple",
            },
            {
              internalType: "address",
              name: "protocolFeesCollector_",
              type: "address",
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
          inputs: [],
          name: "LISTING_FEE",
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
          name: "MAX_LP_TOKENS",
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
          name: "MIN_LP_TOKENS",
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
          name: "activeListing",
          outputs: [
            {
              internalType: "uint256",
              name: "yesVote",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "noVote",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "totalLpAmount",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "endEpoch",
              type: "uint256",
            },
            {
              internalType: "address",
              name: "owner",
              type: "address",
            },
            {
              components: [
                {
                  internalType: "address",
                  name: "token",
                  type: "address",
                },
                {
                  internalType: "uint256",
                  name: "amount",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "nonce",
                  type: "uint256",
                },
              ],
              internalType: "struct TokenPayment",
              name: "securityLpPayment",
              type: "tuple",
            },
            {
              components: [
                {
                  internalType: "address",
                  name: "token",
                  type: "address",
                },
                {
                  internalType: "uint256",
                  name: "amount",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "nonce",
                  type: "uint256",
                },
              ],
              internalType: "struct TokenPayment",
              name: "tradeTokenPayment",
              type: "tuple",
            },
            {
              internalType: "uint256",
              name: "campaignId",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "adexTokenAddress",
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
              internalType: "uint256",
              name: "nonce",
              type: "uint256",
            },
          ],
          name: "claimRewards",
          outputs: [
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
          name: "currentEpoch",
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
              components: [
                {
                  internalType: "address",
                  name: "token",
                  type: "address",
                },
                {
                  internalType: "uint256",
                  name: "amount",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "nonce",
                  type: "uint256",
                },
              ],
              internalType: "struct TokenPayment[]",
              name: "receivedPayments",
              type: "tuple[]",
            },
            {
              internalType: "uint256",
              name: "epochsLocked",
              type: "uint256",
            },
          ],
          name: "enterGovernance",
          outputs: [
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
          name: "epochs",
          outputs: [
            {
              internalType: "uint256",
              name: "genesis",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "epochLength",
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
              name: "nonce",
              type: "uint256",
            },
          ],
          name: "exitGovernance",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "user",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "nonce",
              type: "uint256",
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
          inputs: [],
          name: "getPendingOrListedTokens",
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
              name: "voter",
              type: "address",
            },
          ],
          name: "getUserActiveVoteGTokenNonces",
          outputs: [
            {
              internalType: "uint256[]",
              name: "",
              type: "uint256[]",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "gtokens",
          outputs: [
            {
              internalType: "contract GTokens",
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
              internalType: "uint256",
              name: "nonce",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "extraEpochs",
              type: "uint256",
            },
          ],
          name: "increaseEpochsLocked",
          outputs: [
            {
              components: [
                {
                  internalType: "uint256",
                  name: "rewardPerShare",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "epochStaked",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "epochsLocked",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "lastClaimEpoch",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "lpAmount",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "stakeWeight",
                  type: "uint256",
                },
                {
                  components: [
                    {
                      internalType: "address",
                      name: "token",
                      type: "address",
                    },
                    {
                      internalType: "uint256",
                      name: "amount",
                      type: "uint256",
                    },
                    {
                      internalType: "uint256",
                      name: "nonce",
                      type: "uint256",
                    },
                  ],
                  internalType: "struct TokenPayment[]",
                  name: "lpPayments",
                  type: "tuple[]",
                },
              ],
              internalType: "struct GToken.Attributes",
              name: "attributes",
              type: "tuple",
            },
          ],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "launchPair",
          outputs: [
            {
              internalType: "contract LaunchPair",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "lpTokenAddress",
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
            {
              internalType: "address",
              name: "",
              type: "address",
            },
            {
              internalType: "uint256[]",
              name: "",
              type: "uint256[]",
            },
            {
              internalType: "uint256[]",
              name: "",
              type: "uint256[]",
            },
            {
              internalType: "bytes",
              name: "",
              type: "bytes",
            },
          ],
          name: "onERC1155BatchReceived",
          outputs: [
            {
              internalType: "bytes4",
              name: "",
              type: "bytes4",
            },
          ],
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
            {
              internalType: "address",
              name: "",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
            {
              internalType: "bytes",
              name: "",
              type: "bytes",
            },
          ],
          name: "onERC1155Received",
          outputs: [
            {
              internalType: "bytes4",
              name: "",
              type: "bytes4",
            },
          ],
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
          name: "pairOwnerListing",
          outputs: [
            {
              internalType: "uint256",
              name: "yesVote",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "noVote",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "totalLpAmount",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "endEpoch",
              type: "uint256",
            },
            {
              internalType: "address",
              name: "owner",
              type: "address",
            },
            {
              components: [
                {
                  internalType: "address",
                  name: "token",
                  type: "address",
                },
                {
                  internalType: "uint256",
                  name: "amount",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "nonce",
                  type: "uint256",
                },
              ],
              internalType: "struct TokenPayment",
              name: "securityLpPayment",
              type: "tuple",
            },
            {
              components: [
                {
                  internalType: "address",
                  name: "token",
                  type: "address",
                },
                {
                  internalType: "uint256",
                  name: "amount",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "nonce",
                  type: "uint256",
                },
              ],
              internalType: "struct TokenPayment",
              name: "tradeTokenPayment",
              type: "tuple",
            },
            {
              internalType: "uint256",
              name: "campaignId",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "progressNewPairListing",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              components: [
                {
                  internalType: "address",
                  name: "token",
                  type: "address",
                },
                {
                  internalType: "uint256",
                  name: "amount",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "nonce",
                  type: "uint256",
                },
              ],
              internalType: "struct TokenPayment",
              name: "listingFeePayment",
              type: "tuple",
            },
            {
              components: [
                {
                  internalType: "address",
                  name: "token",
                  type: "address",
                },
                {
                  internalType: "uint256",
                  name: "amount",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "nonce",
                  type: "uint256",
                },
              ],
              internalType: "struct TokenPayment",
              name: "securityPayment",
              type: "tuple",
            },
            {
              components: [
                {
                  internalType: "address",
                  name: "token",
                  type: "address",
                },
                {
                  internalType: "uint256",
                  name: "amount",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "nonce",
                  type: "uint256",
                },
              ],
              internalType: "struct TokenPayment",
              name: "tradeTokenPayment",
              type: "tuple",
            },
          ],
          name: "proposeNewPairListing",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "protocolFees",
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
          name: "recallVoteToken",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              components: [
                {
                  internalType: "address",
                  name: "token",
                  type: "address",
                },
                {
                  internalType: "uint256",
                  name: "amount",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "nonce",
                  type: "uint256",
                },
              ],
              internalType: "struct TokenPayment",
              name: "payment",
              type: "tuple",
            },
          ],
          name: "receiveRewards",
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
          name: "rewardPerShare",
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
          name: "rewardsReserve",
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
          name: "takeProtocolFees",
          outputs: [],
          stateMutability: "nonpayable",
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
          inputs: [
            {
              internalType: "address",
              name: "",
              type: "address",
            },
          ],
          name: "userVote",
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
                  internalType: "address",
                  name: "token",
                  type: "address",
                },
                {
                  internalType: "uint256",
                  name: "amount",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "nonce",
                  type: "uint256",
                },
              ],
              internalType: "struct TokenPayment",
              name: "gTokenPayment",
              type: "tuple",
            },
            {
              internalType: "address",
              name: "tradeToken",
              type: "address",
            },
            {
              internalType: "bool",
              name: "shouldList",
              type: "bool",
            },
          ],
          name: "vote",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          stateMutability: "payable",
          type: "receive",
        },
      ],
      inheritedFunctions: {
        onERC1155BatchReceived:
          "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol",
        onERC1155Received:
          "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol",
        supportsInterface:
          "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol",
        owner: "@openzeppelin/contracts/access/Ownable.sol",
        renounceOwnership: "@openzeppelin/contracts/access/Ownable.sol",
        transferOwnership: "@openzeppelin/contracts/access/Ownable.sol",
      },
    },
    LaunchPair: {
      address: "0x87dFcC19d247181A15f807D3E78ac19a692ab8F7",
      abi: [
        {
          inputs: [
            {
              internalType: "address",
              name: "_lpToken",
              type: "address",
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
              internalType: "uint256",
              name: "campaignId",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "address",
              name: "creator",
              type: "address",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "goal",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "deadline",
              type: "uint256",
            },
          ],
          name: "CampaignCreated",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "campaignId",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "address",
              name: "contributor",
              type: "address",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "amount",
              type: "uint256",
            },
          ],
          name: "ContributionMade",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "campaignId",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "address",
              name: "creator",
              type: "address",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "amount",
              type: "uint256",
            },
          ],
          name: "FundsWithdrawn",
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
              internalType: "uint256",
              name: "campaignId",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "address",
              name: "contributor",
              type: "address",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "amount",
              type: "uint256",
            },
          ],
          name: "RefundIssued",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "campaignId",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "address",
              name: "contributor",
              type: "address",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "amount",
              type: "uint256",
            },
          ],
          name: "TokensDistributed",
          type: "event",
        },
        {
          inputs: [],
          name: "campaignCount",
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
          name: "campaigns",
          outputs: [
            {
              internalType: "address",
              name: "creator",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "lpNonce",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "goal",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "deadline",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "fundsRaised",
              type: "uint256",
            },
            {
              internalType: "bool",
              name: "isWithdrawn",
              type: "bool",
            },
            {
              internalType: "enum LaunchPair.CampaignStatus",
              name: "status",
              type: "uint8",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_campaignId",
              type: "uint256",
            },
          ],
          name: "contribute",
          outputs: [],
          stateMutability: "payable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
            {
              internalType: "address",
              name: "",
              type: "address",
            },
          ],
          name: "contributions",
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
              name: "_creator",
              type: "address",
            },
          ],
          name: "createCampaign",
          outputs: [
            {
              internalType: "uint256",
              name: "campaignId",
              type: "uint256",
            },
          ],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "getActiveCampaigns",
          outputs: [
            {
              internalType: "uint256[]",
              name: "",
              type: "uint256[]",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_campaignId",
              type: "uint256",
            },
          ],
          name: "getCampaignDetails",
          outputs: [
            {
              components: [
                {
                  internalType: "address",
                  name: "creator",
                  type: "address",
                },
                {
                  internalType: "uint256",
                  name: "lpNonce",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "goal",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "deadline",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "fundsRaised",
                  type: "uint256",
                },
                {
                  internalType: "bool",
                  name: "isWithdrawn",
                  type: "bool",
                },
                {
                  internalType: "enum LaunchPair.CampaignStatus",
                  name: "status",
                  type: "uint8",
                },
              ],
              internalType: "struct LaunchPair.Campaign",
              name: "",
              type: "tuple",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_campaignId",
              type: "uint256",
            },
          ],
          name: "getRefunded",
          outputs: [],
          stateMutability: "nonpayable",
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
          name: "getUserCampaigns",
          outputs: [
            {
              internalType: "uint256[]",
              name: "",
              type: "uint256[]",
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
            {
              internalType: "address",
              name: "",
              type: "address",
            },
            {
              internalType: "uint256[]",
              name: "",
              type: "uint256[]",
            },
            {
              internalType: "uint256[]",
              name: "",
              type: "uint256[]",
            },
            {
              internalType: "bytes",
              name: "",
              type: "bytes",
            },
          ],
          name: "onERC1155BatchReceived",
          outputs: [
            {
              internalType: "bytes4",
              name: "",
              type: "bytes4",
            },
          ],
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
            {
              internalType: "address",
              name: "",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
            {
              internalType: "bytes",
              name: "",
              type: "bytes",
            },
          ],
          name: "onERC1155Received",
          outputs: [
            {
              internalType: "bytes4",
              name: "",
              type: "bytes4",
            },
          ],
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
              components: [
                {
                  internalType: "address",
                  name: "token",
                  type: "address",
                },
                {
                  internalType: "uint256",
                  name: "amount",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "nonce",
                  type: "uint256",
                },
              ],
              internalType: "struct TokenPayment",
              name: "payment",
              type: "tuple",
            },
            {
              internalType: "uint256",
              name: "_campaignId",
              type: "uint256",
            },
          ],
          name: "receiveLpToken",
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
              internalType: "uint256",
              name: "_goal",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_duration",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_campaignId",
              type: "uint256",
            },
          ],
          name: "startCampaign",
          outputs: [],
          stateMutability: "nonpayable",
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
          inputs: [
            {
              internalType: "uint256",
              name: "_campaignId",
              type: "uint256",
            },
          ],
          name: "withdrawFunds",
          outputs: [
            {
              internalType: "uint256",
              name: "amount",
              type: "uint256",
            },
          ],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_campaignId",
              type: "uint256",
            },
          ],
          name: "withdrawLaunchPairToken",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
      ],
      inheritedFunctions: {
        owner: "@openzeppelin/contracts/access/Ownable.sol",
        renounceOwnership: "@openzeppelin/contracts/access/Ownable.sol",
        transferOwnership: "@openzeppelin/contracts/access/Ownable.sol",
        onERC1155BatchReceived:
          "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol",
        onERC1155Received:
          "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol",
        supportsInterface:
          "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol",
      },
    },
    LpToken: {
      address: "0x6A358FD7B7700887b0cd974202CdF93208F793E2",
      abi: [
        {
          inputs: [],
          stateMutability: "nonpayable",
          type: "constructor",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "account",
              type: "address",
            },
            {
              indexed: true,
              internalType: "address",
              name: "operator",
              type: "address",
            },
            {
              indexed: false,
              internalType: "bool",
              name: "approved",
              type: "bool",
            },
          ],
          name: "ApprovalForAll",
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
              name: "operator",
              type: "address",
            },
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
              internalType: "uint256[]",
              name: "ids",
              type: "uint256[]",
            },
            {
              indexed: false,
              internalType: "uint256[]",
              name: "values",
              type: "uint256[]",
            },
          ],
          name: "TransferBatch",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "operator",
              type: "address",
            },
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
              name: "id",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "value",
              type: "uint256",
            },
          ],
          name: "TransferSingle",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: false,
              internalType: "string",
              name: "value",
              type: "string",
            },
            {
              indexed: true,
              internalType: "uint256",
              name: "id",
              type: "uint256",
            },
          ],
          name: "URI",
          type: "event",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "account",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "id",
              type: "uint256",
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
          inputs: [
            {
              internalType: "address[]",
              name: "accounts",
              type: "address[]",
            },
            {
              internalType: "uint256[]",
              name: "ids",
              type: "uint256[]",
            },
          ],
          name: "balanceOfBatch",
          outputs: [
            {
              internalType: "uint256[]",
              name: "",
              type: "uint256[]",
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
            {
              internalType: "uint256",
              name: "nonce",
              type: "uint256",
            },
          ],
          name: "getBalanceAt",
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
                    {
                      internalType: "address",
                      name: "tradeToken",
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
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "owner",
              type: "address",
            },
          ],
          name: "getNonces",
          outputs: [
            {
              internalType: "uint256[]",
              name: "",
              type: "uint256[]",
            },
          ],
          stateMutability: "view",
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
              internalType: "uint256",
              name: "nonce",
              type: "uint256",
            },
          ],
          name: "hasSFT",
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
              name: "account",
              type: "address",
            },
            {
              internalType: "address",
              name: "operator",
              type: "address",
            },
          ],
          name: "isApprovedForAll",
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
              name: "user",
              type: "address",
            },
          ],
          name: "lpBalanceOf",
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
                    {
                      internalType: "address",
                      name: "tradeToken",
                      type: "address",
                    },
                  ],
                  internalType: "struct LpToken.LpAttributes",
                  name: "attributes",
                  type: "tuple",
                },
              ],
              internalType: "struct LpToken.LpBalance[]",
              name: "",
              type: "tuple[]",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "rewardPerShare",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "lpAmount",
              type: "uint256",
            },
            {
              internalType: "address",
              name: "pair",
              type: "address",
            },
            {
              internalType: "address",
              name: "tradeToken",
              type: "address",
            },
            {
              internalType: "address",
              name: "to",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "depValuePerShare",
              type: "uint256",
            },
          ],
          name: "mint",
          outputs: [
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
          name: "renounceOwnership",
          outputs: [],
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
              internalType: "uint256[]",
              name: "ids",
              type: "uint256[]",
            },
            {
              internalType: "uint256[]",
              name: "amounts",
              type: "uint256[]",
            },
            {
              internalType: "bytes",
              name: "data",
              type: "bytes",
            },
          ],
          name: "safeBatchTransferFrom",
          outputs: [],
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
              name: "id",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "amount",
              type: "uint256",
            },
            {
              internalType: "bytes",
              name: "data",
              type: "bytes",
            },
          ],
          name: "safeTransferFrom",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "operator",
              type: "address",
            },
            {
              internalType: "bool",
              name: "approved",
              type: "bool",
            },
          ],
          name: "setApprovalForAll",
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
              internalType: "address[]",
              name: "addresses",
              type: "address[]",
            },
            {
              internalType: "uint256[]",
              name: "portions",
              type: "uint256[]",
            },
          ],
          name: "split",
          outputs: [
            {
              internalType: "uint256[]",
              name: "splitNonces",
              type: "uint256[]",
            },
          ],
          stateMutability: "nonpayable",
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
          name: "tokenInfo",
          outputs: [
            {
              internalType: "string",
              name: "",
              type: "string",
            },
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
          inputs: [
            {
              internalType: "address",
              name: "user",
              type: "address",
            },
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
              internalType: "bytes",
              name: "attr",
              type: "bytes",
            },
          ],
          name: "update",
          outputs: [
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
          inputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          name: "uri",
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
      ],
      inheritedFunctions: {
        balanceOf: "contracts/modules/SFT.sol",
        balanceOfBatch: "contracts/modules/SFT.sol",
        getNonces: "contracts/modules/SFT.sol",
        hasSFT: "contracts/modules/SFT.sol",
        isApprovedForAll: "contracts/modules/SFT.sol",
        name: "contracts/modules/SFT.sol",
        owner: "contracts/modules/SFT.sol",
        renounceOwnership: "contracts/modules/SFT.sol",
        safeBatchTransferFrom: "contracts/modules/SFT.sol",
        safeTransferFrom: "contracts/modules/SFT.sol",
        setApprovalForAll: "contracts/modules/SFT.sol",
        supportsInterface: "contracts/modules/SFT.sol",
        symbol: "contracts/modules/SFT.sol",
        tokenInfo: "contracts/modules/SFT.sol",
        transferOwnership: "contracts/modules/SFT.sol",
        update: "contracts/modules/SFT.sol",
        uri: "contracts/modules/SFT.sol",
      },
    },
    Pair: {
      address: "0x0000000000000000000000000000000000000000",
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
                  internalType: "address",
                  name: "token",
                  type: "address",
                },
                {
                  internalType: "uint256",
                  name: "amount",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "nonce",
                  type: "uint256",
                },
              ],
              internalType: "struct TokenPayment",
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
                    {
                      internalType: "address",
                      name: "tradeToken",
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
                    {
                      internalType: "address",
                      name: "tradeToken",
                      type: "address",
                    },
                  ],
                  internalType: "struct LpToken.LpAttributes",
                  name: "attributes",
                  type: "tuple",
                },
              ],
              internalType: "struct LpToken.LpBalance",
              name: "liq",
              type: "tuple",
            },
            {
              internalType: "uint256",
              name: "depositClaimed",
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
                  internalType: "address",
                  name: "token",
                  type: "address",
                },
                {
                  internalType: "uint256",
                  name: "amount",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "nonce",
                  type: "uint256",
                },
              ],
              internalType: "struct TokenPayment",
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
      address: "0xa82fF9aFd8f496c3d6ac40E2a0F282E47488CFc9",
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
                  internalType: "address",
                  name: "token",
                  type: "address",
                },
                {
                  internalType: "uint256",
                  name: "amount",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "nonce",
                  type: "uint256",
                },
              ],
              internalType: "struct TokenPayment",
              name: "wholePayment",
              type: "tuple",
            },
          ],
          name: "addLiquidity",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "payable",
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
          outputs: [
            {
              internalType: "uint256",
              name: "totalClaimed",
              type: "uint256",
            },
            {
              internalType: "uint256[]",
              name: "newNonces",
              type: "uint256[]",
            },
          ],
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
              components: [
                {
                  internalType: "address",
                  name: "token",
                  type: "address",
                },
                {
                  internalType: "uint256",
                  name: "amount",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "nonce",
                  type: "uint256",
                },
              ],
              internalType: "struct TokenPayment",
              name: "payment",
              type: "tuple",
            },
          ],
          name: "createPair",
          outputs: [
            {
              internalType: "address",
              name: "pairAddress",
              type: "address",
            },
            {
              components: [
                {
                  internalType: "address",
                  name: "token",
                  type: "address",
                },
                {
                  internalType: "uint256",
                  name: "amount",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "nonce",
                  type: "uint256",
                },
              ],
              internalType: "struct TokenPayment",
              name: "lpPayment",
              type: "tuple",
            },
          ],
          stateMutability: "payable",
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
              name: "user",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "nonce",
              type: "uint256",
            },
          ],
          name: "getClaimableRewardsAt",
          outputs: [
            {
              internalType: "uint256",
              name: "claimable",
              type: "uint256",
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
          name: "getClaimableRewardsByNonces",
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
          name: "getReferrals",
          outputs: [
            {
              components: [
                {
                  internalType: "uint256",
                  name: "id",
                  type: "uint256",
                },
                {
                  internalType: "address",
                  name: "referralAddress",
                  type: "address",
                },
              ],
              internalType: "struct UserModule.ReferralInfo[]",
              name: "",
              type: "tuple[]",
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
          name: "getWEDU",
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
          name: "globalData",
          outputs: [
            {
              internalType: "uint256",
              name: "rewardsReserve",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "taxRewards",
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
          name: "governance",
          outputs: [
            {
              internalType: "contract Governance",
              name: "",
              type: "address",
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
          inputs: [
            {
              internalType: "address",
              name: "",
              type: "address",
            },
            {
              internalType: "address",
              name: "",
              type: "address",
            },
            {
              internalType: "uint256[]",
              name: "",
              type: "uint256[]",
            },
            {
              internalType: "uint256[]",
              name: "",
              type: "uint256[]",
            },
            {
              internalType: "bytes",
              name: "",
              type: "bytes",
            },
          ],
          name: "onERC1155BatchReceived",
          outputs: [
            {
              internalType: "bytes4",
              name: "",
              type: "bytes4",
            },
          ],
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
            {
              internalType: "address",
              name: "",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
            {
              internalType: "bytes",
              name: "",
              type: "bytes",
            },
          ],
          name: "onERC1155Received",
          outputs: [
            {
              internalType: "bytes4",
              name: "",
              type: "bytes4",
            },
          ],
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
                  internalType: "address",
                  name: "token",
                  type: "address",
                },
                {
                  internalType: "uint256",
                  name: "amount",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "nonce",
                  type: "uint256",
                },
              ],
              internalType: "struct TokenPayment",
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
          stateMutability: "payable",
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
          inputs: [
            {
              components: [
                {
                  internalType: "address",
                  name: "token",
                  type: "address",
                },
                {
                  internalType: "uint256",
                  name: "amount",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "nonce",
                  type: "uint256",
                },
              ],
              internalType: "struct TokenPayment",
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
          stateMutability: "payable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "tokenAddress",
              type: "address",
            },
          ],
          name: "tokenIsListed",
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
        addLiquidity: "contracts/router/IRouter.sol",
        claimRewards: "contracts/router/IRouter.sol",
        createPair: "contracts/router/IRouter.sol",
        getClaimableRewardsByNonces: "contracts/router/IRouter.sol",
        tokenIsListed: "contracts/router/IRouter.sol",
        owner: "@openzeppelin/contracts/access/Ownable.sol",
        renounceOwnership: "@openzeppelin/contracts/access/Ownable.sol",
        transferOwnership: "@openzeppelin/contracts/access/Ownable.sol",
        onERC1155BatchReceived:
          "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol",
        onERC1155Received:
          "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol",
        supportsInterface:
          "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol",
      },
    },
  },
  656476: {
    GTokens: {
      address: "0x95523052CfF3E73B76C97fEC082a3673D01EF7E7",
      abi: [
        {
          inputs: [
            {
              components: [
                {
                  internalType: "uint256",
                  name: "genesis",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "epochLength",
                  type: "uint256",
                },
              ],
              internalType: "struct Epochs.Storage",
              name: "epochs_",
              type: "tuple",
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
              name: "account",
              type: "address",
            },
            {
              indexed: true,
              internalType: "address",
              name: "operator",
              type: "address",
            },
            {
              indexed: false,
              internalType: "bool",
              name: "approved",
              type: "bool",
            },
          ],
          name: "ApprovalForAll",
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
              name: "operator",
              type: "address",
            },
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
              internalType: "uint256[]",
              name: "ids",
              type: "uint256[]",
            },
            {
              indexed: false,
              internalType: "uint256[]",
              name: "values",
              type: "uint256[]",
            },
          ],
          name: "TransferBatch",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "operator",
              type: "address",
            },
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
              name: "id",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "value",
              type: "uint256",
            },
          ],
          name: "TransferSingle",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: false,
              internalType: "string",
              name: "value",
              type: "string",
            },
            {
              indexed: true,
              internalType: "uint256",
              name: "id",
              type: "uint256",
            },
          ],
          name: "URI",
          type: "event",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "account",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "id",
              type: "uint256",
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
          inputs: [
            {
              internalType: "address[]",
              name: "accounts",
              type: "address[]",
            },
            {
              internalType: "uint256[]",
              name: "ids",
              type: "uint256[]",
            },
          ],
          name: "balanceOfBatch",
          outputs: [
            {
              internalType: "uint256[]",
              name: "",
              type: "uint256[]",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "epochs",
          outputs: [
            {
              internalType: "uint256",
              name: "genesis",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "epochLength",
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
              name: "user",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "nonce",
              type: "uint256",
            },
          ],
          name: "getBalanceAt",
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
                  internalType: "uint256",
                  name: "votePower",
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
                      name: "epochStaked",
                      type: "uint256",
                    },
                    {
                      internalType: "uint256",
                      name: "epochsLocked",
                      type: "uint256",
                    },
                    {
                      internalType: "uint256",
                      name: "lastClaimEpoch",
                      type: "uint256",
                    },
                    {
                      internalType: "uint256",
                      name: "lpAmount",
                      type: "uint256",
                    },
                    {
                      internalType: "uint256",
                      name: "stakeWeight",
                      type: "uint256",
                    },
                    {
                      components: [
                        {
                          internalType: "address",
                          name: "token",
                          type: "address",
                        },
                        {
                          internalType: "uint256",
                          name: "amount",
                          type: "uint256",
                        },
                        {
                          internalType: "uint256",
                          name: "nonce",
                          type: "uint256",
                        },
                      ],
                      internalType: "struct TokenPayment[]",
                      name: "lpPayments",
                      type: "tuple[]",
                    },
                  ],
                  internalType: "struct GToken.Attributes",
                  name: "attributes",
                  type: "tuple",
                },
              ],
              internalType: "struct GTokensBalance",
              name: "",
              type: "tuple",
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
          name: "getGTokenBalance",
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
                  internalType: "uint256",
                  name: "votePower",
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
                      name: "epochStaked",
                      type: "uint256",
                    },
                    {
                      internalType: "uint256",
                      name: "epochsLocked",
                      type: "uint256",
                    },
                    {
                      internalType: "uint256",
                      name: "lastClaimEpoch",
                      type: "uint256",
                    },
                    {
                      internalType: "uint256",
                      name: "lpAmount",
                      type: "uint256",
                    },
                    {
                      internalType: "uint256",
                      name: "stakeWeight",
                      type: "uint256",
                    },
                    {
                      components: [
                        {
                          internalType: "address",
                          name: "token",
                          type: "address",
                        },
                        {
                          internalType: "uint256",
                          name: "amount",
                          type: "uint256",
                        },
                        {
                          internalType: "uint256",
                          name: "nonce",
                          type: "uint256",
                        },
                      ],
                      internalType: "struct TokenPayment[]",
                      name: "lpPayments",
                      type: "tuple[]",
                    },
                  ],
                  internalType: "struct GToken.Attributes",
                  name: "attributes",
                  type: "tuple",
                },
              ],
              internalType: "struct GTokensBalance[]",
              name: "",
              type: "tuple[]",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "owner",
              type: "address",
            },
          ],
          name: "getNonces",
          outputs: [
            {
              internalType: "uint256[]",
              name: "",
              type: "uint256[]",
            },
          ],
          stateMutability: "view",
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
              internalType: "uint256",
              name: "nonce",
              type: "uint256",
            },
          ],
          name: "hasSFT",
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
              name: "account",
              type: "address",
            },
            {
              internalType: "address",
              name: "operator",
              type: "address",
            },
          ],
          name: "isApprovedForAll",
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
              name: "to",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "rewardPerShare",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "epochsLocked",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "lpAmount",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "currentEpoch",
              type: "uint256",
            },
            {
              components: [
                {
                  internalType: "address",
                  name: "token",
                  type: "address",
                },
                {
                  internalType: "uint256",
                  name: "amount",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "nonce",
                  type: "uint256",
                },
              ],
              internalType: "struct TokenPayment[]",
              name: "lpPayments",
              type: "tuple[]",
            },
          ],
          name: "mintGToken",
          outputs: [
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
          name: "renounceOwnership",
          outputs: [],
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
              internalType: "uint256[]",
              name: "ids",
              type: "uint256[]",
            },
            {
              internalType: "uint256[]",
              name: "amounts",
              type: "uint256[]",
            },
            {
              internalType: "bytes",
              name: "data",
              type: "bytes",
            },
          ],
          name: "safeBatchTransferFrom",
          outputs: [],
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
              name: "id",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "amount",
              type: "uint256",
            },
            {
              internalType: "bytes",
              name: "data",
              type: "bytes",
            },
          ],
          name: "safeTransferFrom",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "operator",
              type: "address",
            },
            {
              internalType: "bool",
              name: "approved",
              type: "bool",
            },
          ],
          name: "setApprovalForAll",
          outputs: [],
          stateMutability: "nonpayable",
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
          name: "tokenInfo",
          outputs: [
            {
              internalType: "string",
              name: "",
              type: "string",
            },
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
          name: "totalLpAmount",
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
          name: "totalStakeWeight",
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
          inputs: [
            {
              internalType: "address",
              name: "user",
              type: "address",
            },
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
                  name: "epochStaked",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "epochsLocked",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "lastClaimEpoch",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "lpAmount",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "stakeWeight",
                  type: "uint256",
                },
                {
                  components: [
                    {
                      internalType: "address",
                      name: "token",
                      type: "address",
                    },
                    {
                      internalType: "uint256",
                      name: "amount",
                      type: "uint256",
                    },
                    {
                      internalType: "uint256",
                      name: "nonce",
                      type: "uint256",
                    },
                  ],
                  internalType: "struct TokenPayment[]",
                  name: "lpPayments",
                  type: "tuple[]",
                },
              ],
              internalType: "struct GToken.Attributes",
              name: "attr",
              type: "tuple",
            },
          ],
          name: "update",
          outputs: [
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
          inputs: [
            {
              internalType: "address",
              name: "user",
              type: "address",
            },
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
              internalType: "bytes",
              name: "attr",
              type: "bytes",
            },
          ],
          name: "update",
          outputs: [
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
          inputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          name: "uri",
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
      ],
      inheritedFunctions: {},
    },
    Governance: {
      address: "0xCb5c1Af75320c01DBBc4E696b2BA6e808CfFB0EB",
      abi: [
        {
          inputs: [
            {
              internalType: "address",
              name: "_lpToken",
              type: "address",
            },
            {
              internalType: "address",
              name: "_adex",
              type: "address",
            },
            {
              components: [
                {
                  internalType: "uint256",
                  name: "genesis",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "epochLength",
                  type: "uint256",
                },
              ],
              internalType: "struct Epochs.Storage",
              name: "epochs_",
              type: "tuple",
            },
            {
              internalType: "address",
              name: "protocolFeesCollector_",
              type: "address",
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
          inputs: [],
          name: "LISTING_FEE",
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
          name: "MAX_LP_TOKENS",
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
          name: "MIN_LP_TOKENS",
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
          name: "activeListing",
          outputs: [
            {
              internalType: "uint256",
              name: "yesVote",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "noVote",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "totalLpAmount",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "endEpoch",
              type: "uint256",
            },
            {
              internalType: "address",
              name: "owner",
              type: "address",
            },
            {
              components: [
                {
                  internalType: "address",
                  name: "token",
                  type: "address",
                },
                {
                  internalType: "uint256",
                  name: "amount",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "nonce",
                  type: "uint256",
                },
              ],
              internalType: "struct TokenPayment",
              name: "securityLpPayment",
              type: "tuple",
            },
            {
              components: [
                {
                  internalType: "address",
                  name: "token",
                  type: "address",
                },
                {
                  internalType: "uint256",
                  name: "amount",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "nonce",
                  type: "uint256",
                },
              ],
              internalType: "struct TokenPayment",
              name: "tradeTokenPayment",
              type: "tuple",
            },
            {
              internalType: "uint256",
              name: "campaignId",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "adexTokenAddress",
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
              internalType: "uint256",
              name: "nonce",
              type: "uint256",
            },
          ],
          name: "claimRewards",
          outputs: [
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
          name: "currentEpoch",
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
              components: [
                {
                  internalType: "address",
                  name: "token",
                  type: "address",
                },
                {
                  internalType: "uint256",
                  name: "amount",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "nonce",
                  type: "uint256",
                },
              ],
              internalType: "struct TokenPayment[]",
              name: "receivedPayments",
              type: "tuple[]",
            },
            {
              internalType: "uint256",
              name: "epochsLocked",
              type: "uint256",
            },
          ],
          name: "enterGovernance",
          outputs: [
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
          name: "epochs",
          outputs: [
            {
              internalType: "uint256",
              name: "genesis",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "epochLength",
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
              name: "nonce",
              type: "uint256",
            },
          ],
          name: "exitGovernance",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "user",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "nonce",
              type: "uint256",
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
          inputs: [],
          name: "getPendingOrListedTokens",
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
              name: "voter",
              type: "address",
            },
          ],
          name: "getUserActiveVoteGTokenNonces",
          outputs: [
            {
              internalType: "uint256[]",
              name: "",
              type: "uint256[]",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "gtokens",
          outputs: [
            {
              internalType: "contract GTokens",
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
              internalType: "uint256",
              name: "nonce",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "extraEpochs",
              type: "uint256",
            },
          ],
          name: "increaseEpochsLocked",
          outputs: [
            {
              components: [
                {
                  internalType: "uint256",
                  name: "rewardPerShare",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "epochStaked",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "epochsLocked",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "lastClaimEpoch",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "lpAmount",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "stakeWeight",
                  type: "uint256",
                },
                {
                  components: [
                    {
                      internalType: "address",
                      name: "token",
                      type: "address",
                    },
                    {
                      internalType: "uint256",
                      name: "amount",
                      type: "uint256",
                    },
                    {
                      internalType: "uint256",
                      name: "nonce",
                      type: "uint256",
                    },
                  ],
                  internalType: "struct TokenPayment[]",
                  name: "lpPayments",
                  type: "tuple[]",
                },
              ],
              internalType: "struct GToken.Attributes",
              name: "attributes",
              type: "tuple",
            },
          ],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "launchPair",
          outputs: [
            {
              internalType: "contract LaunchPair",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "lpTokenAddress",
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
            {
              internalType: "address",
              name: "",
              type: "address",
            },
            {
              internalType: "uint256[]",
              name: "",
              type: "uint256[]",
            },
            {
              internalType: "uint256[]",
              name: "",
              type: "uint256[]",
            },
            {
              internalType: "bytes",
              name: "",
              type: "bytes",
            },
          ],
          name: "onERC1155BatchReceived",
          outputs: [
            {
              internalType: "bytes4",
              name: "",
              type: "bytes4",
            },
          ],
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
            {
              internalType: "address",
              name: "",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
            {
              internalType: "bytes",
              name: "",
              type: "bytes",
            },
          ],
          name: "onERC1155Received",
          outputs: [
            {
              internalType: "bytes4",
              name: "",
              type: "bytes4",
            },
          ],
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
          name: "pairOwnerListing",
          outputs: [
            {
              internalType: "uint256",
              name: "yesVote",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "noVote",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "totalLpAmount",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "endEpoch",
              type: "uint256",
            },
            {
              internalType: "address",
              name: "owner",
              type: "address",
            },
            {
              components: [
                {
                  internalType: "address",
                  name: "token",
                  type: "address",
                },
                {
                  internalType: "uint256",
                  name: "amount",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "nonce",
                  type: "uint256",
                },
              ],
              internalType: "struct TokenPayment",
              name: "securityLpPayment",
              type: "tuple",
            },
            {
              components: [
                {
                  internalType: "address",
                  name: "token",
                  type: "address",
                },
                {
                  internalType: "uint256",
                  name: "amount",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "nonce",
                  type: "uint256",
                },
              ],
              internalType: "struct TokenPayment",
              name: "tradeTokenPayment",
              type: "tuple",
            },
            {
              internalType: "uint256",
              name: "campaignId",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "progressNewPairListing",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              components: [
                {
                  internalType: "address",
                  name: "token",
                  type: "address",
                },
                {
                  internalType: "uint256",
                  name: "amount",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "nonce",
                  type: "uint256",
                },
              ],
              internalType: "struct TokenPayment",
              name: "listingFeePayment",
              type: "tuple",
            },
            {
              components: [
                {
                  internalType: "address",
                  name: "token",
                  type: "address",
                },
                {
                  internalType: "uint256",
                  name: "amount",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "nonce",
                  type: "uint256",
                },
              ],
              internalType: "struct TokenPayment",
              name: "securityPayment",
              type: "tuple",
            },
            {
              components: [
                {
                  internalType: "address",
                  name: "token",
                  type: "address",
                },
                {
                  internalType: "uint256",
                  name: "amount",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "nonce",
                  type: "uint256",
                },
              ],
              internalType: "struct TokenPayment",
              name: "tradeTokenPayment",
              type: "tuple",
            },
          ],
          name: "proposeNewPairListing",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "protocolFees",
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
          name: "recallVoteToken",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              components: [
                {
                  internalType: "address",
                  name: "token",
                  type: "address",
                },
                {
                  internalType: "uint256",
                  name: "amount",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "nonce",
                  type: "uint256",
                },
              ],
              internalType: "struct TokenPayment",
              name: "payment",
              type: "tuple",
            },
          ],
          name: "receiveRewards",
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
          name: "rewardPerShare",
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
          name: "rewardsReserve",
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
          name: "takeProtocolFees",
          outputs: [],
          stateMutability: "nonpayable",
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
          inputs: [
            {
              internalType: "address",
              name: "",
              type: "address",
            },
          ],
          name: "userVote",
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
                  internalType: "address",
                  name: "token",
                  type: "address",
                },
                {
                  internalType: "uint256",
                  name: "amount",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "nonce",
                  type: "uint256",
                },
              ],
              internalType: "struct TokenPayment",
              name: "gTokenPayment",
              type: "tuple",
            },
            {
              internalType: "address",
              name: "tradeToken",
              type: "address",
            },
            {
              internalType: "bool",
              name: "shouldList",
              type: "bool",
            },
          ],
          name: "vote",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          stateMutability: "payable",
          type: "receive",
        },
      ],
      inheritedFunctions: {
        onERC1155BatchReceived:
          "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol",
        onERC1155Received:
          "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol",
        supportsInterface:
          "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol",
        owner: "@openzeppelin/contracts/access/Ownable.sol",
        renounceOwnership: "@openzeppelin/contracts/access/Ownable.sol",
        transferOwnership: "@openzeppelin/contracts/access/Ownable.sol",
      },
    },
    LaunchPair: {
      address: "0x96F05a8202F2297AD5E87167423D4dd3B032125D",
      abi: [
        {
          inputs: [
            {
              internalType: "address",
              name: "_lpToken",
              type: "address",
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
              internalType: "uint256",
              name: "campaignId",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "address",
              name: "creator",
              type: "address",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "goal",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "deadline",
              type: "uint256",
            },
          ],
          name: "CampaignCreated",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "campaignId",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "address",
              name: "contributor",
              type: "address",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "amount",
              type: "uint256",
            },
          ],
          name: "ContributionMade",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "campaignId",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "address",
              name: "creator",
              type: "address",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "amount",
              type: "uint256",
            },
          ],
          name: "FundsWithdrawn",
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
              internalType: "uint256",
              name: "campaignId",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "address",
              name: "contributor",
              type: "address",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "amount",
              type: "uint256",
            },
          ],
          name: "RefundIssued",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "campaignId",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "address",
              name: "contributor",
              type: "address",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "amount",
              type: "uint256",
            },
          ],
          name: "TokensDistributed",
          type: "event",
        },
        {
          inputs: [],
          name: "campaignCount",
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
          name: "campaigns",
          outputs: [
            {
              internalType: "address",
              name: "creator",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "lpNonce",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "goal",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "deadline",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "fundsRaised",
              type: "uint256",
            },
            {
              internalType: "bool",
              name: "isWithdrawn",
              type: "bool",
            },
            {
              internalType: "enum LaunchPair.CampaignStatus",
              name: "status",
              type: "uint8",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_campaignId",
              type: "uint256",
            },
          ],
          name: "contribute",
          outputs: [],
          stateMutability: "payable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
            {
              internalType: "address",
              name: "",
              type: "address",
            },
          ],
          name: "contributions",
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
              name: "_creator",
              type: "address",
            },
          ],
          name: "createCampaign",
          outputs: [
            {
              internalType: "uint256",
              name: "campaignId",
              type: "uint256",
            },
          ],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "getActiveCampaigns",
          outputs: [
            {
              internalType: "uint256[]",
              name: "",
              type: "uint256[]",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_campaignId",
              type: "uint256",
            },
          ],
          name: "getCampaignDetails",
          outputs: [
            {
              components: [
                {
                  internalType: "address",
                  name: "creator",
                  type: "address",
                },
                {
                  internalType: "uint256",
                  name: "lpNonce",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "goal",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "deadline",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "fundsRaised",
                  type: "uint256",
                },
                {
                  internalType: "bool",
                  name: "isWithdrawn",
                  type: "bool",
                },
                {
                  internalType: "enum LaunchPair.CampaignStatus",
                  name: "status",
                  type: "uint8",
                },
              ],
              internalType: "struct LaunchPair.Campaign",
              name: "",
              type: "tuple",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_campaignId",
              type: "uint256",
            },
          ],
          name: "getRefunded",
          outputs: [],
          stateMutability: "nonpayable",
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
          name: "getUserCampaigns",
          outputs: [
            {
              internalType: "uint256[]",
              name: "",
              type: "uint256[]",
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
            {
              internalType: "address",
              name: "",
              type: "address",
            },
            {
              internalType: "uint256[]",
              name: "",
              type: "uint256[]",
            },
            {
              internalType: "uint256[]",
              name: "",
              type: "uint256[]",
            },
            {
              internalType: "bytes",
              name: "",
              type: "bytes",
            },
          ],
          name: "onERC1155BatchReceived",
          outputs: [
            {
              internalType: "bytes4",
              name: "",
              type: "bytes4",
            },
          ],
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
            {
              internalType: "address",
              name: "",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
            {
              internalType: "bytes",
              name: "",
              type: "bytes",
            },
          ],
          name: "onERC1155Received",
          outputs: [
            {
              internalType: "bytes4",
              name: "",
              type: "bytes4",
            },
          ],
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
              components: [
                {
                  internalType: "address",
                  name: "token",
                  type: "address",
                },
                {
                  internalType: "uint256",
                  name: "amount",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "nonce",
                  type: "uint256",
                },
              ],
              internalType: "struct TokenPayment",
              name: "payment",
              type: "tuple",
            },
            {
              internalType: "uint256",
              name: "_campaignId",
              type: "uint256",
            },
          ],
          name: "receiveLpToken",
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
              internalType: "uint256",
              name: "_goal",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_duration",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_campaignId",
              type: "uint256",
            },
          ],
          name: "startCampaign",
          outputs: [],
          stateMutability: "nonpayable",
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
          inputs: [
            {
              internalType: "uint256",
              name: "_campaignId",
              type: "uint256",
            },
          ],
          name: "withdrawFunds",
          outputs: [
            {
              internalType: "uint256",
              name: "amount",
              type: "uint256",
            },
          ],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_campaignId",
              type: "uint256",
            },
          ],
          name: "withdrawLaunchPairToken",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
      ],
      inheritedFunctions: {
        owner: "@openzeppelin/contracts/access/Ownable.sol",
        renounceOwnership: "@openzeppelin/contracts/access/Ownable.sol",
        transferOwnership: "@openzeppelin/contracts/access/Ownable.sol",
        onERC1155BatchReceived:
          "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol",
        onERC1155Received:
          "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol",
        supportsInterface:
          "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol",
      },
    },
    LpToken: {
      address: "0x5EbE9041fDa8aA336F15b1bd68577bcDAE4d529E",
      abi: [
        {
          inputs: [],
          stateMutability: "nonpayable",
          type: "constructor",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "account",
              type: "address",
            },
            {
              indexed: true,
              internalType: "address",
              name: "operator",
              type: "address",
            },
            {
              indexed: false,
              internalType: "bool",
              name: "approved",
              type: "bool",
            },
          ],
          name: "ApprovalForAll",
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
              name: "operator",
              type: "address",
            },
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
              internalType: "uint256[]",
              name: "ids",
              type: "uint256[]",
            },
            {
              indexed: false,
              internalType: "uint256[]",
              name: "values",
              type: "uint256[]",
            },
          ],
          name: "TransferBatch",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "operator",
              type: "address",
            },
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
              name: "id",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "value",
              type: "uint256",
            },
          ],
          name: "TransferSingle",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: false,
              internalType: "string",
              name: "value",
              type: "string",
            },
            {
              indexed: true,
              internalType: "uint256",
              name: "id",
              type: "uint256",
            },
          ],
          name: "URI",
          type: "event",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "account",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "id",
              type: "uint256",
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
          inputs: [
            {
              internalType: "address[]",
              name: "accounts",
              type: "address[]",
            },
            {
              internalType: "uint256[]",
              name: "ids",
              type: "uint256[]",
            },
          ],
          name: "balanceOfBatch",
          outputs: [
            {
              internalType: "uint256[]",
              name: "",
              type: "uint256[]",
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
            {
              internalType: "uint256",
              name: "nonce",
              type: "uint256",
            },
          ],
          name: "getBalanceAt",
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
                    {
                      internalType: "address",
                      name: "tradeToken",
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
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "owner",
              type: "address",
            },
          ],
          name: "getNonces",
          outputs: [
            {
              internalType: "uint256[]",
              name: "",
              type: "uint256[]",
            },
          ],
          stateMutability: "view",
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
              internalType: "uint256",
              name: "nonce",
              type: "uint256",
            },
          ],
          name: "hasSFT",
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
              name: "account",
              type: "address",
            },
            {
              internalType: "address",
              name: "operator",
              type: "address",
            },
          ],
          name: "isApprovedForAll",
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
              name: "user",
              type: "address",
            },
          ],
          name: "lpBalanceOf",
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
                    {
                      internalType: "address",
                      name: "tradeToken",
                      type: "address",
                    },
                  ],
                  internalType: "struct LpToken.LpAttributes",
                  name: "attributes",
                  type: "tuple",
                },
              ],
              internalType: "struct LpToken.LpBalance[]",
              name: "",
              type: "tuple[]",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "rewardPerShare",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "lpAmount",
              type: "uint256",
            },
            {
              internalType: "address",
              name: "pair",
              type: "address",
            },
            {
              internalType: "address",
              name: "tradeToken",
              type: "address",
            },
            {
              internalType: "address",
              name: "to",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "depValuePerShare",
              type: "uint256",
            },
          ],
          name: "mint",
          outputs: [
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
          name: "renounceOwnership",
          outputs: [],
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
              internalType: "uint256[]",
              name: "ids",
              type: "uint256[]",
            },
            {
              internalType: "uint256[]",
              name: "amounts",
              type: "uint256[]",
            },
            {
              internalType: "bytes",
              name: "data",
              type: "bytes",
            },
          ],
          name: "safeBatchTransferFrom",
          outputs: [],
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
              name: "id",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "amount",
              type: "uint256",
            },
            {
              internalType: "bytes",
              name: "data",
              type: "bytes",
            },
          ],
          name: "safeTransferFrom",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "operator",
              type: "address",
            },
            {
              internalType: "bool",
              name: "approved",
              type: "bool",
            },
          ],
          name: "setApprovalForAll",
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
              internalType: "address[]",
              name: "addresses",
              type: "address[]",
            },
            {
              internalType: "uint256[]",
              name: "portions",
              type: "uint256[]",
            },
          ],
          name: "split",
          outputs: [
            {
              internalType: "uint256[]",
              name: "splitNonces",
              type: "uint256[]",
            },
          ],
          stateMutability: "nonpayable",
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
          name: "tokenInfo",
          outputs: [
            {
              internalType: "string",
              name: "",
              type: "string",
            },
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
          inputs: [
            {
              internalType: "address",
              name: "user",
              type: "address",
            },
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
              internalType: "bytes",
              name: "attr",
              type: "bytes",
            },
          ],
          name: "update",
          outputs: [
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
          inputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          name: "uri",
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
      ],
      inheritedFunctions: {
        balanceOf: "contracts/modules/SFT.sol",
        balanceOfBatch: "contracts/modules/SFT.sol",
        getNonces: "contracts/modules/SFT.sol",
        hasSFT: "contracts/modules/SFT.sol",
        isApprovedForAll: "contracts/modules/SFT.sol",
        name: "contracts/modules/SFT.sol",
        owner: "contracts/modules/SFT.sol",
        renounceOwnership: "contracts/modules/SFT.sol",
        safeBatchTransferFrom: "contracts/modules/SFT.sol",
        safeTransferFrom: "contracts/modules/SFT.sol",
        setApprovalForAll: "contracts/modules/SFT.sol",
        supportsInterface: "contracts/modules/SFT.sol",
        symbol: "contracts/modules/SFT.sol",
        tokenInfo: "contracts/modules/SFT.sol",
        transferOwnership: "contracts/modules/SFT.sol",
        update: "contracts/modules/SFT.sol",
        uri: "contracts/modules/SFT.sol",
      },
    },
    Pair: {
      address: "0x06E1A0fAD44fc7eBDC68900ad487eb386a037A0c",
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
                  internalType: "address",
                  name: "token",
                  type: "address",
                },
                {
                  internalType: "uint256",
                  name: "amount",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "nonce",
                  type: "uint256",
                },
              ],
              internalType: "struct TokenPayment",
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
                    {
                      internalType: "address",
                      name: "tradeToken",
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
                    {
                      internalType: "address",
                      name: "tradeToken",
                      type: "address",
                    },
                  ],
                  internalType: "struct LpToken.LpAttributes",
                  name: "attributes",
                  type: "tuple",
                },
              ],
              internalType: "struct LpToken.LpBalance",
              name: "liq",
              type: "tuple",
            },
            {
              internalType: "uint256",
              name: "depositClaimed",
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
                  internalType: "address",
                  name: "token",
                  type: "address",
                },
                {
                  internalType: "uint256",
                  name: "amount",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "nonce",
                  type: "uint256",
                },
              ],
              internalType: "struct TokenPayment",
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
      address: "0xE450d810f6Ee1ac1D1DC1c50c42d8F15f6544091",
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
                  internalType: "address",
                  name: "token",
                  type: "address",
                },
                {
                  internalType: "uint256",
                  name: "amount",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "nonce",
                  type: "uint256",
                },
              ],
              internalType: "struct TokenPayment",
              name: "wholePayment",
              type: "tuple",
            },
          ],
          name: "addLiquidity",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "payable",
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
          outputs: [
            {
              internalType: "uint256",
              name: "totalClaimed",
              type: "uint256",
            },
            {
              internalType: "uint256[]",
              name: "newNonces",
              type: "uint256[]",
            },
          ],
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
              components: [
                {
                  internalType: "address",
                  name: "token",
                  type: "address",
                },
                {
                  internalType: "uint256",
                  name: "amount",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "nonce",
                  type: "uint256",
                },
              ],
              internalType: "struct TokenPayment",
              name: "payment",
              type: "tuple",
            },
          ],
          name: "createPair",
          outputs: [
            {
              internalType: "address",
              name: "pairAddress",
              type: "address",
            },
            {
              components: [
                {
                  internalType: "address",
                  name: "token",
                  type: "address",
                },
                {
                  internalType: "uint256",
                  name: "amount",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "nonce",
                  type: "uint256",
                },
              ],
              internalType: "struct TokenPayment",
              name: "lpPayment",
              type: "tuple",
            },
          ],
          stateMutability: "payable",
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
              name: "user",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "nonce",
              type: "uint256",
            },
          ],
          name: "getClaimableRewardsAt",
          outputs: [
            {
              internalType: "uint256",
              name: "claimable",
              type: "uint256",
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
          name: "getClaimableRewardsByNonces",
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
          name: "getReferrals",
          outputs: [
            {
              components: [
                {
                  internalType: "uint256",
                  name: "id",
                  type: "uint256",
                },
                {
                  internalType: "address",
                  name: "referralAddress",
                  type: "address",
                },
              ],
              internalType: "struct UserModule.ReferralInfo[]",
              name: "",
              type: "tuple[]",
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
          name: "getWEDU",
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
          name: "globalData",
          outputs: [
            {
              internalType: "uint256",
              name: "rewardsReserve",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "taxRewards",
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
          name: "governance",
          outputs: [
            {
              internalType: "contract Governance",
              name: "",
              type: "address",
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
          inputs: [
            {
              internalType: "address",
              name: "",
              type: "address",
            },
            {
              internalType: "address",
              name: "",
              type: "address",
            },
            {
              internalType: "uint256[]",
              name: "",
              type: "uint256[]",
            },
            {
              internalType: "uint256[]",
              name: "",
              type: "uint256[]",
            },
            {
              internalType: "bytes",
              name: "",
              type: "bytes",
            },
          ],
          name: "onERC1155BatchReceived",
          outputs: [
            {
              internalType: "bytes4",
              name: "",
              type: "bytes4",
            },
          ],
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
            {
              internalType: "address",
              name: "",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
            {
              internalType: "bytes",
              name: "",
              type: "bytes",
            },
          ],
          name: "onERC1155Received",
          outputs: [
            {
              internalType: "bytes4",
              name: "",
              type: "bytes4",
            },
          ],
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
                  internalType: "address",
                  name: "token",
                  type: "address",
                },
                {
                  internalType: "uint256",
                  name: "amount",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "nonce",
                  type: "uint256",
                },
              ],
              internalType: "struct TokenPayment",
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
          stateMutability: "payable",
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
          inputs: [
            {
              components: [
                {
                  internalType: "address",
                  name: "token",
                  type: "address",
                },
                {
                  internalType: "uint256",
                  name: "amount",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "nonce",
                  type: "uint256",
                },
              ],
              internalType: "struct TokenPayment",
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
          stateMutability: "payable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "tokenAddress",
              type: "address",
            },
          ],
          name: "tokenIsListed",
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
        addLiquidity: "contracts/router/IRouter.sol",
        claimRewards: "contracts/router/IRouter.sol",
        createPair: "contracts/router/IRouter.sol",
        getClaimableRewardsByNonces: "contracts/router/IRouter.sol",
        tokenIsListed: "contracts/router/IRouter.sol",
        owner: "@openzeppelin/contracts/access/Ownable.sol",
        renounceOwnership: "@openzeppelin/contracts/access/Ownable.sol",
        transferOwnership: "@openzeppelin/contracts/access/Ownable.sol",
        onERC1155BatchReceived:
          "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol",
        onERC1155Received:
          "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol",
        supportsInterface:
          "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol",
      },
    },
  },
} as const;

export default deployedContracts satisfies GenericContractsDeclaration;

import { AbiFunctionReturnType, ContractAbi } from "~~/utils/scaffold-eth/contract";

export type LaunchPairAbiType = ContractAbi<"LaunchPair">;
export type Campaign = AbiFunctionReturnType<LaunchPairAbiType, "getCampaignDetails">;

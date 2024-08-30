import { useDeployedContractInfo, useScaffoldReadContract } from "./scaffold-eth";
import { useAccount, useWriteContract } from "wagmi";
import { useSwapableTokens } from "~~/components/Swap/hooks";
import nonceToRandString from "~~/utils/nonceToRandom";
import { AbiFunctionReturnType, ContractAbi } from "~~/utils/scaffold-eth/contract";

export type LpTokenAbiType = ContractAbi<"LpToken">;
export type LpBalances = AbiFunctionReturnType<LpTokenAbiType, "lpBalanceOf">;
export type LpBalanceWithId = LpBalances[number] & { identifier: string };
export type LpBalancesWithId = LpBalanceWithId[];

export default function useLpTokens(): { lpBalances: LpBalancesWithId | undefined } {
  const { address: userAddress } = useAccount();

  const { tokenMap } = useSwapableTokens({ address: userAddress });
  const { data: lpBalances } = useScaffoldReadContract({
    contractName: "LpToken",
    functionName: "lpBalanceOf",
    args: [userAddress],
  });

  return {
    lpBalances: lpBalances?.map(({ nonce, attributes: { pair, ...otherAttributes }, ...otherProps }) => ({
      ...otherProps,
      nonce,
      attributes: { pair, ...otherAttributes },
      identifier: tokenMap.get(pair)?.identifier + "-" + nonceToRandString(nonce, pair),
    })),
  };
}

export const useGovernanceSpendsLp = () => {
  const { address: userAddress } = useAccount();
  const { data: Governance } = useDeployedContractInfo("Governance");
  const { data: LpToken } = useDeployedContractInfo("LpToken");
  const { data: canSpendLp } = useScaffoldReadContract({
    contractName: "LpToken",
    functionName: "isApprovedForAll",
    args: [userAddress, Governance?.address],
  });
  const { writeContractAsync } = useWriteContract();

  return {
    canSpendLp,
    tryApproveGovLpSpend: async () => {
      if (!Governance || !LpToken || canSpendLp == undefined) {
        throw new Error("Contracts not loaded");
      }
      !canSpendLp &&
        (await writeContractAsync({
          abi: LpToken.abi,
          address: LpToken.address,
          functionName: "setApprovalForAll",
          args: [Governance.address, true],
        }));
    },
  };
};

import { useScaffoldReadContract } from "./scaffold-eth";
import { useAccount } from "wagmi";
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

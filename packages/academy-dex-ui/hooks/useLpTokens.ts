import { useScaffoldReadContract } from "./scaffold-eth";
import { useAccount } from "wagmi";

export default function useLpTokens() {
  const { address: userAddress } = useAccount();
  const { data: lpBalances } = useScaffoldReadContract({
    contractName: "LpToken",
    functionName: "lpBalanceOf",
    args: [userAddress],
  });

  return { lpBalances };
}

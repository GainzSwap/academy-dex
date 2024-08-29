import { useScaffoldReadContract } from "./scaffold-eth";

export const useBasePairAddr = () => {
  const { data: basePairAddr } = useScaffoldReadContract({
    contractName: "Router",
    functionName: "basePairAddr",
    watch: false,
  });

  return { basePairAddr };
};

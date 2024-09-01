import { useDeployedContractInfo, useTargetNetwork } from "./scaffold-eth";
import { usePublicClient } from "wagmi";

export default function useRawCallsInfo() {
  const { targetNetwork } = useTargetNetwork();

  const { data: router } = useDeployedContractInfo("Router");
  const { data: pairInfo } = useDeployedContractInfo("Pair");
  const { data: governance } = useDeployedContractInfo("Governance");
  const client = usePublicClient({ chainId: targetNetwork.id });

  return { client, pairInfo, router, governance };
}

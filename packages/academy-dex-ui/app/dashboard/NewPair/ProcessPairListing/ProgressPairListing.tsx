import { Campaign } from "./types";
import { useBlock, useWriteContract } from "wagmi";
import TxButton from "~~/components/TxButton";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";

export function ProgressPairListing({ campaign }: { campaign: Campaign }) {
  const { data: Governance } = useDeployedContractInfo("Governance");
  const { writeContractAsync } = useWriteContract();
  const { data: block } = useBlock({ watch: true });

  const progressListing = async () => {
    if (!Governance || !block) {
      throw new Error("Progress Pailisiting data not loaded");
    }

    const execCall = () =>
      writeContractAsync({
        abi: Governance.abi,
        address: Governance.address,
        functionName: "progressNewPairListing",
      });

    if (campaign.goal > 0 && block.timestamp > campaign.deadline) {
      if (campaign.fundsRaised >= campaign.goal) {
        // Campaign success full, so we would call `progressNewPairListing` twice, hence this call
        await execCall();
      }
    }

    return await execCall();
  };

  return <TxButton onClick={() => progressListing()} btnName="Progress Listing Process" className="btn btn-warning" />;
}

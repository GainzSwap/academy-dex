import { useWriteContract } from "wagmi";
import TxButton from "~~/components/TxButton";
import { useDeployedContractInfo, useScaffoldReadContract } from "~~/hooks/scaffold-eth";

export default function ProcessUserContributedCampaign({ campaignId }: { campaignId: bigint }) {
  const { data: campaign } = useScaffoldReadContract({
    contractName: "LaunchPair",
    functionName: "getCampaignDetails",
    args: [campaignId],
  });

  const { data: LaunchPair } = useDeployedContractInfo("LaunchPair");
  const { writeContractAsync } = useWriteContract();

  if (!campaign) {
    return null;
  }

  const isSuccess = campaign.goal <= campaign.fundsRaised;
  const runCall = async () => {
    if (!LaunchPair) {
      throw new Error("LaunchPair contract not loaded");
    }

    return await writeContractAsync({
      abi: LaunchPair.abi,
      address: LaunchPair.address,
      functionName: isSuccess ? "withdrawLaunchPairToken" : "getRefunded",
      args: [campaignId],
    });
  };

  return (
    <TxButton
      className={`btn btn-${isSuccess ? "success" : "primary"}`}
      btnName={!isSuccess ? "Get Campaign Refund" : "Get Campaign LP Tokens"}
      onClick={() => runCall()}
    />
  );
}

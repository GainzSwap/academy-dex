import { ProgressPairListing } from "./ProgressPairListing";
import StartCampaign from "./StartCampaign";
import LoadingState from "~~/components/LoadingState";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { useComputeTimeleft } from "~~/hooks/useComputeTimeleft";
import { TokenListing } from "~~/types/utils";

export default function ProcessPairListing({ listing: { campaignId } }: { listing: TokenListing }) {
  const { data: campaign } = useScaffoldReadContract({
    contractName: "LaunchPair",
    functionName: "getCampaignDetails",
    args: [campaignId],
  });
  const { block } = useComputeTimeleft({ deadline: campaign?.deadline || 0n });

  if (!campaign || !block) {
    return <LoadingState text="Getting Campaign Details" />;
  }

  if (campaignId == 0n || (campaign.goal > 0n && campaign.deadline < block.timestamp)) {
    return <ProgressPairListing campaign={campaign} />;
  } else if (campaign.goal == 0n) {
    return <StartCampaign campaignId={campaignId} />;
  }
}

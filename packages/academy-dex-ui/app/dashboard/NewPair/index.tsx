import React from "react";
import CreateNewListing from "./CreateNewListing";
import ProcessPairListing from "./ProcessPairListing";
import ProcessUserContributedCampaign from "./ProcessUserContributedCampaign";
import VoteOnActiveListing from "./VoteOnActiveListing";
import { useGovernanceCurrentEpoch } from "./hooks";
import { useAccount, useWriteContract } from "wagmi";
import TxButton from "~~/components/TxButton";
import { useDeployedContractInfo, useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { TokenListing } from "~~/types/utils";
import { isZeroAddress } from "~~/utils/scaffold-eth/common";

export default function NewPair({
  activeListing,
  userListing,
  hasListing,
  userContibutedCampaignIDs,
}: {
  activeListing?: TokenListing;
  userListing?: TokenListing;
  hasListing: boolean;
  userContibutedCampaignIDs: readonly bigint[] | undefined;
}) {
  const { address: userAddress } = useAccount();

  const { data: currentVoteToken } = useScaffoldReadContract({
    contractName: "Governance",
    functionName: "userVote",
    args: [userAddress],
  });

  const { data: currentEpoch } = useGovernanceCurrentEpoch();

  if (
    !userContibutedCampaignIDs ||
    !activeListing ||
    currentEpoch == undefined ||
    userListing == undefined ||
    !currentVoteToken ||
    !userAddress
  ) {
    return null;
  }

  let display: [string, React.ReactNode];

  const canRecallVote = !isZeroAddress(currentVoteToken);
  const isToCreateNewListing = isZeroAddress(activeListing.owner);

  if (currentEpoch >= activeListing.endEpoch && hasListing) {
    display = [
      "Process Pair Listing",
      <ProcessPairListing
        listing={activeListing.owner == userAddress ? activeListing : userListing}
        key={"process-pair-listing"}
      />,
    ];
  } else if (userContibutedCampaignIDs.length > 0) {
    display = [
      "",
      <ProcessUserContributedCampaign
        key={"ProcessUserContributedCampaign"}
        campaignId={userContibutedCampaignIDs[0]}
      />,
    ];
  } else if (currentEpoch >= activeListing.endEpoch && canRecallVote) {
    display = ["Recall Vote", <RecallVote key={"recall-vote"} />];
  } else {
    display = isToCreateNewListing
      ? ["List New Token", <CreateNewListing key={"create-new-listing"} />]
      : ["Voting", <VoteOnActiveListing activeListing={activeListing} key={"vote"} />];
  }
  const [heading, component] = display;

  return (
    <div className="element-wrapper compact pt-4">
      <h6 className="element-header"> {heading}</h6>
      <div className="element-box-tp">{component}</div>
    </div>
  );
}

function RecallVote() {
  const { data: Governance } = useDeployedContractInfo("Governance");
  const { writeContractAsync } = useWriteContract();

  const recallVote = async () => {
    if (!Governance) {
      throw new Error("Governance contract not loaded");
    }

    return await writeContractAsync({
      abi: Governance.abi,
      address: Governance.address,
      functionName: "recallVoteToken",
    });
  };

  return <TxButton onClick={() => recallVote()} btnName="Recall Vote" className="btn btn-success" />;
}

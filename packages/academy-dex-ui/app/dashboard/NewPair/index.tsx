import React from "react";
import CreateNewListing from "./CreateNewListing";
import VoteOnActiveListing from "./VoteOnActiveListing";
import { useGovernanceCurrentEpoch } from "./hooks";
import { useAccount, useWriteContract } from "wagmi";
import TxButton from "~~/components/TxButton";
import { useDeployedContractInfo, useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { TokenListing } from "~~/types/utils";
import { isZeroAddress } from "~~/utils/scaffold-eth/common";
import ProcessPairListing from "./ProcessPairListing";

const reduceToTokenListing = (
  list: readonly [
    bigint,
    bigint,
    bigint,
    bigint,
    string,
    {
      token: string;
      amount: bigint;
      nonce: bigint;
    },
    {
      token: string;
      amount: bigint;
      nonce: bigint;
    },
    bigint,
  ],
): TokenListing => {
  const [yesVote, noVote, totalLpAmount, endEpoch, owner, securityLpPayment, tradeTokenPayment, campaignId] = list;

  return {
    yesVote,
    noVote,
    totalLpAmount,
    campaignId,
    endEpoch,
    owner,
    securityLpPayment,
    tradeTokenPayment,
  };
};

export default function NewPair() {
  const { address: userAddress } = useAccount();
  const { data: _activeListing } = useScaffoldReadContract({
    contractName: "Governance",
    functionName: "activeListing",
  });
  const activeListing = _activeListing && reduceToTokenListing(_activeListing);

  const { data: _userListing } = useScaffoldReadContract({
    contractName: "Governance",
    functionName: "pairOwnerListing",
    args: [userAddress],
  });
  const userListing = _userListing && reduceToTokenListing(_userListing);

  const { data: currentVoteToken } = useScaffoldReadContract({
    contractName: "Governance",
    functionName: "userVote",
    args: [userAddress],
  });

  const { data: currentEpoch } = useGovernanceCurrentEpoch();

  if (!activeListing || currentEpoch == undefined || userListing == undefined || !currentVoteToken || !userAddress) {
    return null;
  }

  let display: [string, React.ReactNode];

  const hasLisiting = activeListing.owner == userAddress || !isZeroAddress(userListing.owner);
  const canRecallVote = !isZeroAddress(currentVoteToken);
  const isToCreateNewLisiting = isZeroAddress(activeListing.owner);

  if (currentEpoch >= activeListing.endEpoch && hasLisiting) {
    display = [
      "Process Pair Listing",
      <ProcessPairListing
        lisiting={activeListing.owner == userAddress ? activeListing : userListing}
        key={"process-pair-lisiting"}
      />,
    ];
  } else if (currentEpoch >= activeListing.endEpoch && canRecallVote) {
    display = ["Recall Vote", <RecallVote key={"recall-vote"} />];
  } else {
    display = isToCreateNewLisiting
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

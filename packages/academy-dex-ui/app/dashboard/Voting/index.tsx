import CreateNewListing from "./CreateNewListing";
import VoteOnActiveListing from "./VoteOnActiveListing";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { TokenListing } from "~~/types/utils";
import { isZeroAddress } from "~~/utils/scaffold-eth/common";

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

export default function Voting() {
  const { data: _activeListing } = useScaffoldReadContract({
    contractName: "Governance",
    functionName: "activeListing",
  });
  const activeListing = _activeListing && reduceToTokenListing(_activeListing);

  if (!activeListing) {
    return null;
  }

  const isToCreateNewLisiting = isZeroAddress(activeListing.owner);
  return (
    <div className="element-wrapper compact pt-4">
      <h6 className="element-header"> {isToCreateNewLisiting ? "List New Token" : "Voting"}</h6>
      <div className="element-box-tp">
        {isToCreateNewLisiting ? <CreateNewListing /> : <VoteOnActiveListing activeListing={activeListing} />}
      </div>
    </div>
  );
}

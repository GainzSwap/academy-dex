import { useMemo } from "react";
import { ReferralIDStructure } from "./structure";
import { CopyButton } from "@multiversx/sdk-dapp/UI/CopyButton/CopyButton";
import useSWR from "swr";
import { useAccount } from "wagmi";
import { RefIdData, getWindowLocation } from "~~/utils";

export default function ReferralCard() {
  const { address } = useAccount();
  const { data: refIdData } = useSWR(
    address ? { key: "refdata-getAffiliateDetails", address } : null,
    ({ address }) =>
      // TODO get user ID from Router contract or User maanger contract
      new RefIdData(address, 0),
  );
  const joinLink = useMemo(() => {
    return typeof window !== "undefined" && refIdData?.refID
      ? `${getWindowLocation().origin}/${ReferralIDStructure.makeUrlSegment(refIdData.refID)}`
      : "";
  }, [refIdData]);

  if (!joinLink) {
    return (
      <div className="cta-w orange text-center">
        <div className="cta-content extra-padded">
          <div className="highlight-header">Bonus</div>
          <h5 className="cta-header">Make your first swap to get a referral link and enjoy more rewards</h5>
        </div>
      </div>
    );
  }

  return (
    <div className="cta-w orange text-center">
      <div className="cta-content extra-padded">
        <div className="highlight-header">Bonus</div>
        <h5 className="cta-header">Invite your friends and enjoy more rewards with referrals</h5>
        <span className="badge bg-success">
          <span id="ref_link">{joinLink}</span>
        </span>
        <CopyButton className="text-white ml-2" text={joinLink} />
      </div>
    </div>
  );
}

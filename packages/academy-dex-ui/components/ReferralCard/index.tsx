"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { useReferralInfo } from "./hooks";
import { ReferralIDStructure } from "./structure";
import { CopyButton } from "@multiversx/sdk-dapp/UI/CopyButton/CopyButton";
import { getWindowLocation } from "~~/utils";

export default function ReferralCard() {
  const { refIdData, refresh: refreshRefIdData, user, botStart } = useReferralInfo();

  const joinLink = useMemo(() => {
    return typeof window !== "undefined" && refIdData?.refID
      ? `${getWindowLocation().origin}/${ReferralIDStructure.makeUrlSegment(refIdData.refID)}`
      : "";
  }, [refIdData]);

  useEffect(() => {
    const timer = refIdData?.refID
      ? undefined
      : setInterval(() => {
          refreshRefIdData();
        }, 3_000);

    return () => clearInterval(timer);
  }, [refIdData]);

  if (user === undefined || botStart === undefined) {
    return null;
  }

  const tgBotInviteLink = user.tgUser?.refID;
  return (
    <div id="RefCard" className="element-wrapper">
      <div className="cta-w orange text-center">
        <div className="cta-content extra-padded">
          <div className="highlight-header">Bonus</div>
          {joinLink ? (
            <>
              {!tgBotInviteLink ? (
                <>
                  <h5 className="cta-header">Interact with the telegram bot to get your referral link</h5>

                  <Link target="_blank" href={botStart} className="btn btn-success" style={{ color: "white" }}>
                    Open Bot
                  </Link>
                </>
              ) : (
                <>
                  <h5 className="cta-header">Invite your friends and enjoy more rewards with referrals</h5>
                  <span className="badge bg-success">
                    <span id="ref_link">{tgBotInviteLink}</span>
                  </span>
                  <CopyButton className="text-white ml-2" text={tgBotInviteLink} />
                </>
              )}
            </>
          ) : (
            <>
              <h5 className="cta-header">Make your first swap to get a referral link and enjoy more rewards</h5>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

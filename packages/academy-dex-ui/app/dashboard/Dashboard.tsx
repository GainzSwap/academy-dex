"use client";

import Link from "next/link";
import AddLiquidity from "./AddLiquidity";
import NewPair from "./NewPair";
import CreateNewListing from "./NewPair/CreateNewListing";
import { FundCampaign } from "./NewPair/ProcessPairListing/FundCampaign";
import PortfolioDistribution from "./PortfolioDistribution";
import Referrals from "./Referrals";
import RemoveLiquidityButton from "./RemoveLiquidity";
import Sidebar from "./Sidebar";
import StakingAndGovernace from "./StakingAndGovernace";
import Swap from "./Swap";
import TopBar from "./TopBar";
import { zeroAddress } from "viem";
import { useAccount, useBlock } from "wagmi";
import FaucetClaim from "~~/components/FaucetClaim";
import ReferralCard from "~~/components/ReferralCard";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { useContentPanel } from "~~/hooks/useContentPanel";
import { isZeroAddress } from "~~/utils/scaffold-eth/common";

export default function Dashboard() {
  const { data: block } = useBlock({ watch: true });
  const { address: userAddress } = useAccount();

  const { data: userContibutedCampaignIDs } = useScaffoldReadContract({
    contractName: "LaunchPair",
    functionName: "getUserCampaigns",
    args: [userAddress],
  });
  const { data: lastCampaignId } = useScaffoldReadContract({
    contractName: "LaunchPair",
    functionName: "campaignCount",
  });
  const { data: lastCampaign } = useScaffoldReadContract({
    contractName: "LaunchPair",
    functionName: "getCampaignDetails",
    args: [userContibutedCampaignIDs?.at(-1) || lastCampaignId],
  });
  const { toggleContentPanel } = useContentPanel();

  const { data: activeListing } = useScaffoldReadContract({
    contractName: "Governance",
    functionName: "activeListing",
  });

  const { data: userListing } = useScaffoldReadContract({
    contractName: "Governance",
    functionName: "pairOwnerListing",
    args: [userAddress],
  });

  const hasListing =
    activeListing?.owner == userAddress || !isZeroAddress(userListing?.tradeTokenPayment.token || zeroAddress);
  const campaignToFundExists =
    block && lastCampaign ? lastCampaign.goal > 0 && lastCampaign.deadline > block.timestamp : false;

  return (
    <>
      <TopBar />
      <div onClick={toggleContentPanel} className="content-panel-toggler">
        <i className="os-icon os-icon-grid-squares-22"></i>
        <span>Sidebar</span>
      </div>
      <div className="content-i">
        <div className="content-box" style={{ minHeight: "95vh" }}>
          <div className="row">
            <FaucetClaim />
          </div>
          <div className="row">
            <div className="col-sm-12 col-lg-6">
              <div className="justify-content-between mobile-full-width">
                <Swap />
                <Link
                  target="_blank"
                  href="https://t.me/AcademyDEX"
                  className={`btn btn-success w-100 btn-lg`}
                  style={{ color: "white", marginBottom: "5px" }}
                >
                  join us on Telegram
                </Link>
              </div>
              <div className="element-wrapper pb-4 mb-4 border-bottom">
                <div className="element-box-tp">
                  <AddLiquidity />
                  <RemoveLiquidityButton />
                </div>
              </div>
              <Referrals />
            </div>

            <div className="col-sm-2 d-none d-lg-block">
              <PortfolioDistribution />
            </div>

            <div className="col-sm-6 col-md-4 col-12">
              <StakingAndGovernace />
              <ReferralCard />
            </div>
          </div>
          <div className="row">
            <div className="col-12 col-xxl-8">
              {campaignToFundExists ? (
                <FundCampaign campaign={lastCampaign} campaignId={lastCampaignId} />
              ) : (
                <NewPair
                  userContibutedCampaignIDs={userContibutedCampaignIDs}
                  activeListing={activeListing}
                  userListing={userListing}
                  hasListing={hasListing}
                />
              )}
            </div>
            <div className="col-sm-4">{!hasListing && campaignToFundExists && <CreateNewListing />}</div>
          </div>
        </div>

        <Sidebar />
      </div>
    </>
  );
}

import { BigNumberish } from "ethers";
import { ethers } from "hardhat";
import { expect } from "chai";
import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers";

describe("LaunchPair", function () {
  async function deployLaunchPairFixture() {
    const [owner, creator, contributor, ...otherUsers] = await ethers.getSigners();

    // Deploy the LaunchPair contract
    const LaunchPairFactory = await ethers.getContractFactory("LaunchPair");
    const launchPair = await LaunchPairFactory.deploy();
    await launchPair.waitForDeployment();

    // Helper function for creating a campaign
    const createCampaign = async (goal: BigNumberish, duration: BigNumberish) => {
      // Deploy a LaunchPair Token (ERC20) contract
      const LaunchPairTokenFactory = await ethers.getContractFactory("MintableERC20");
      const launchPairToken = await LaunchPairTokenFactory.deploy(
        "LaunchPairToken",
        "LPT" + (await launchPair.campaignCount()),
      );
      await launchPairToken.waitForDeployment();

      const tokensToDistribute = ethers.parseUnits("10000", 18);
      await launchPairToken.mint(owner, tokensToDistribute);
      await launchPairToken.connect(owner).approve(launchPair, tokensToDistribute);
      await launchPair.createCampaign(
        {
          token: await launchPairToken.getAddress(),
          amount: tokensToDistribute,
          nonce: 0,
        },
        creator.address,
      );

      const campaignID = await launchPair.campaignCount();
      await launchPair.connect(creator).startCampaign(goal, duration, campaignID);

      return { campaignID, launchPairToken };
    };

    return {
      otherUsers,
      owner,
      creator,
      contributor,
      launchPair,
      createCampaign,
    };
  }

  it("should create and start a campaign", async function () {
    const { launchPair, creator, createCampaign } = await loadFixture(deployLaunchPairFixture);
    const goal = ethers.parseUnits("100", 18);
    const duration = 60 * 60 * 24 * 7; // 1 week

    const { campaignID } = await createCampaign(goal, duration);
    const campaign = await launchPair.getCampaignDetails(campaignID);

    expect(campaign.creator).to.equal(creator.address);
    expect(campaign.goal).to.equal(goal);
    expect(campaign.status).to.equal(1); // CampaignStatus.Funding
  });

  it("should allow contributions to a campaign", async function () {
    const { launchPair, contributor, createCampaign } = await loadFixture(deployLaunchPairFixture);
    const goal = ethers.parseUnits("100", 18);
    const duration = 60 * 60 * 24 * 7; // 1 week

    const { campaignID } = await createCampaign(goal, duration);

    const contributionAmount = ethers.parseUnits("50", 18);
    await launchPair.connect(contributor).contribute(campaignID, { value: contributionAmount });

    const campaign = await launchPair.getCampaignDetails(campaignID);
    expect(campaign.fundsRaised).to.equal(contributionAmount);

    const contribution = await launchPair.contributions(campaignID, contributor.address);
    expect(contribution).to.equal(contributionAmount);
  });

  it("should allow the campaign creator to withdraw funds after a successful campaign", async function () {
    const { launchPair, creator, contributor, createCampaign } = await loadFixture(deployLaunchPairFixture);
    const goal = ethers.parseUnits("100", 18);
    const duration = 60 * 60 * 24 * 7; // 1 week

    const { campaignID } = await createCampaign(goal, duration);

    const contributionAmount = ethers.parseUnits("100", 18);
    await launchPair.connect(contributor).contribute(campaignID, { value: contributionAmount });

    await launchPair.connect(creator).withdrawFunds(campaignID);

    const campaign = await launchPair.getCampaignDetails(campaignID);
    expect(campaign.status).to.equal(3); // CampaignStatus.Success
  });

  it("should allow participants to withdraw launchPair tokens after a successful campaign", async function () {
    const { launchPair, creator, contributor, createCampaign } = await loadFixture(deployLaunchPairFixture);
    const goal = ethers.parseUnits("100", 18);
    const duration = 60 * 60 * 24 * 7; // 1 week

    const { campaignID, launchPairToken } = await createCampaign(goal, duration);

    const contributionAmount = ethers.parseUnits("100", 18);
    await launchPair.connect(contributor).contribute(campaignID, { value: contributionAmount });
    await launchPair.connect(creator).withdrawFunds(campaignID);

    await launchPair.connect(contributor).withdrawLaunchPairToken(campaignID);

    const tokenBalance = await launchPairToken.balanceOf(contributor.address);
    expect(tokenBalance).to.equal(ethers.parseUnits("10000", 18));
  });

  it("should allow participants to get a refund after a failed campaign", async function () {
    const { launchPair, creator, contributor, createCampaign } = await loadFixture(deployLaunchPairFixture);
    const goal = ethers.parseUnits("200", 18);
    const duration = 60 * 60 * 24 * 7; // 1 week

    const { campaignID } = await createCampaign(goal, duration);

    const contributionAmount = ethers.parseUnits("100", 18);
    await launchPair.connect(contributor).contribute(campaignID, { value: contributionAmount });

    // Simulate time passing and the campaign failing
    await time.increase(duration + 1);

    await launchPair.connect(contributor).getRefunded(campaignID);

    const campaign = await launchPair.getCampaignDetails(campaignID);
    expect(campaign.status).to.equal(2); // CampaignStatus.Failed
  });
});

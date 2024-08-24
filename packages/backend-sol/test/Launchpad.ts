import { BigNumberish } from "ethers";
import { ethers } from "hardhat";
import { expect } from "chai";
import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers";

describe("Launchpad", function () {
  async function deployLaunchpadFixture() {
    const [owner, creator, contributor, ...otherUsers] = await ethers.getSigners();

    // Deploy the Launchpad contract
    const LaunchpadFactory = await ethers.getContractFactory("Launchpad");
    const launchpad = await LaunchpadFactory.deploy();
    await launchpad.waitForDeployment();

    // Helper function for creating a campaign
    const createCampaign = async (goal: BigNumberish, duration: BigNumberish) => {
      // Deploy a Launchpad Token (ERC20) contract
      const LaunchpadTokenFactory = await ethers.getContractFactory("MintableERC20");
      const launchpadToken = await LaunchpadTokenFactory.deploy(
        "LaunchpadToken",
        "LPT" + (await launchpad.campaignCount()),
      );
      await launchpadToken.waitForDeployment();

      const tokensToDistribute = ethers.parseUnits("10000", 18);
      await launchpadToken.mint(owner, tokensToDistribute);
      await launchpadToken.connect(owner).approve(launchpad, tokensToDistribute);
      await launchpad.createCampaign(
        {
          token: await launchpadToken.getAddress(),
          amount: tokensToDistribute,
          nonce: 0,
        },
        creator.address,
      );

      const campaignID = await launchpad.campaignCount();
      await launchpad.connect(creator).startCampaign(goal, duration, campaignID);

      return { campaignID, launchpadToken };
    };

    return {
      otherUsers,
      owner,
      creator,
      contributor,
      launchpad,
      createCampaign,
    };
  }

  it("should create and start a campaign", async function () {
    const { launchpad, creator, createCampaign } = await loadFixture(deployLaunchpadFixture);
    const goal = ethers.parseUnits("100", 18);
    const duration = 60 * 60 * 24 * 7; // 1 week

    const { campaignID } = await createCampaign(goal, duration);
    const campaign = await launchpad.getCampaignDetails(campaignID);

    expect(campaign.creator).to.equal(creator.address);
    expect(campaign.goal).to.equal(goal);
    expect(campaign.status).to.equal(1); // CampaignStatus.Funding
  });

  it("should allow contributions to a campaign", async function () {
    const { launchpad, contributor, createCampaign } = await loadFixture(deployLaunchpadFixture);
    const goal = ethers.parseUnits("100", 18);
    const duration = 60 * 60 * 24 * 7; // 1 week

    const { campaignID } = await createCampaign(goal, duration);

    const contributionAmount = ethers.parseUnits("50", 18);
    await launchpad.connect(contributor).contribute(campaignID, { value: contributionAmount });

    const campaign = await launchpad.getCampaignDetails(campaignID);
    expect(campaign.fundsRaised).to.equal(contributionAmount);

    const contribution = await launchpad.contributions(campaignID, contributor.address);
    expect(contribution).to.equal(contributionAmount);
  });

  it("should allow the campaign creator to withdraw funds after a successful campaign", async function () {
    const { launchpad, creator, contributor, createCampaign } = await loadFixture(deployLaunchpadFixture);
    const goal = ethers.parseUnits("100", 18);
    const duration = 60 * 60 * 24 * 7; // 1 week

    const { campaignID } = await createCampaign(goal, duration);

    const contributionAmount = ethers.parseUnits("100", 18);
    await launchpad.connect(contributor).contribute(campaignID, { value: contributionAmount });

    await launchpad.connect(creator).withdrawFunds(campaignID);

    const campaign = await launchpad.getCampaignDetails(campaignID);
    expect(campaign.status).to.equal(3); // CampaignStatus.Success
  });

  it("should allow participants to withdraw launchpad tokens after a successful campaign", async function () {
    const { launchpad, creator, contributor, createCampaign } = await loadFixture(deployLaunchpadFixture);
    const goal = ethers.parseUnits("100", 18);
    const duration = 60 * 60 * 24 * 7; // 1 week

    const { campaignID, launchpadToken } = await createCampaign(goal, duration);

    const contributionAmount = ethers.parseUnits("100", 18);
    await launchpad.connect(contributor).contribute(campaignID, { value: contributionAmount });
    await launchpad.connect(creator).withdrawFunds(campaignID);

    await launchpad.connect(contributor).withdrawLaunchpadToken(campaignID);

    const tokenBalance = await launchpadToken.balanceOf(contributor.address);
    expect(tokenBalance).to.equal(ethers.parseUnits("10000", 18));
  });

  it("should allow participants to get a refund after a failed campaign", async function () {
    const { launchpad, creator, contributor, createCampaign } = await loadFixture(deployLaunchpadFixture);
    const goal = ethers.parseUnits("200", 18);
    const duration = 60 * 60 * 24 * 7; // 1 week

    const { campaignID } = await createCampaign(goal, duration);

    const contributionAmount = ethers.parseUnits("100", 18);
    await launchpad.connect(contributor).contribute(campaignID, { value: contributionAmount });

    // Simulate time passing and the campaign failing
    await time.increase(duration + 1);

    await launchpad.connect(contributor).getRefunded(campaignID);

    const campaign = await launchpad.getCampaignDetails(campaignID);
    expect(campaign.status).to.equal(2); // CampaignStatus.Failed
  });
});

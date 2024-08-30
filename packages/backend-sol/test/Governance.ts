import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers } from "hardhat";
import { expect } from "chai";
import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers";
import { BigNumberish, parseEther, ZeroAddress } from "ethers";

import { claimRewardsFixture } from "./fixtures";
import { TokenPaymentStruct } from "../typechain-types/contracts/governance/Governance";

describe("Governance Contract", function () {
  async function deployGovernanceFixture() {
    const [owner, user, ...otherUsers] = await ethers.getSigners();

    // Deploy the LP Token contract
    const LpTokenFactory = await ethers.getContractFactory("LpToken");
    const lpToken = await LpTokenFactory.deploy();
    await lpToken.waitForDeployment();

    // Deploy the LP Token contract
    const AdexTokenFactory = await ethers.getContractFactory("MintableADEX");
    const adexToken = await AdexTokenFactory.deploy();
    await adexToken.waitForDeployment();

    // Mint  tokens to the user
    await lpToken.mint(0, 10_000, ZeroAddress, adexToken, user, 0);

    // Deploy the Governance contract
    const GovernanceFactory = await ethers.getContractFactory("Governance", {
      libraries: {
        NewGTokens: await (await ethers.deployContract("NewGTokens")).getAddress(),
        DeployLaunchPair: await (await ethers.deployContract("DeployLaunchPair")).getAddress(),
      },
    });
    const governance = await GovernanceFactory.deploy(
      await lpToken.getAddress(),
      await adexToken.getAddress(),
      {
        epochLength: 24 * 60 * 60,
        genesis: await time.latest(),
      },
      owner,
    );
    await governance.waitForDeployment();

    // Approve the governance contract to spend LP tokens
    await lpToken.connect(user).setApprovalForAll(governance, true);

    // Get the GTokens contract instance
    const gTokensAddress = await governance.gtokens();
    const gTokens = await ethers.getContractAt("GTokens", gTokensAddress);

    // Helper function for entering governance
    const enterGovernance = async (
      signer: HardhatEthersSigner,
      ...args: Parameters<(typeof governance)["enterGovernance"]>
    ) => {
      return await governance.connect(signer).enterGovernance(...args);
    };

    const [{ nonce, amount }] = await lpToken.lpBalanceOf(user);
    const validPayment = {
      nonce,
      token: await lpToken.getAddress(),
      amount,
    };

    return {
      owner,
      user,
      otherUsers,
      governance,
      gTokens,
      adexToken,
      lpToken,
      enterGovernance,
      validPayment,
    };
  }

  describe("Deployment", function () {
    it("Should deploy the Governance contract with correct LP token address", async function () {
      const { governance, lpToken } = await loadFixture(deployGovernanceFixture);
      expect(await governance.lpTokenAddress()).to.equal(await lpToken.getAddress());
    });

    it("Should deploy GTokens contract through Governance contract", async function () {
      const { gTokens } = await loadFixture(deployGovernanceFixture);
      expect(await gTokens.name()).to.equal("ADEX Governance Token");
    });
  });

  describe("enterGovernance", function () {
    it("Should fail if less than MIN_LP_TOKENS are provided", async function () {
      const { governance } = await loadFixture(deployGovernanceFixture);
      const invalidPayment = {
        nonce: 1,
        token: ZeroAddress,
        amount: ethers.parseEther("0.1"),
      };

      await expect(governance.enterGovernance([invalidPayment], 100)).to.be.revertedWith(
        "Governance: Invalid LpPayments sent",
      );
    });

    it("Should fail if more than MAX_LP_TOKENS are provided", async function () {
      const { governance, lpToken } = await loadFixture(deployGovernanceFixture);
      const validPayments = [];

      for (let i = 0; i < 11; i++) {
        validPayments.push({
          nonce: i + 1,
          token: await lpToken.getAddress(),
          amount: ethers.parseEther("0.1"),
        });
      }

      await expect(governance.enterGovernance(validPayments, 10)).to.be.revertedWith(
        "Governance: Invalid LpPayments sent",
      );
    });

    it("Should successfully enter governance with valid LP payments", async function () {
      const { governance, gTokens, user, validPayment } = await loadFixture(deployGovernanceFixture);

      const tx = await governance.connect(user).enterGovernance([validPayment], 100);

      await expect(tx)
        .to.emit(gTokens, "TransferSingle")
        .withArgs(governance, ZeroAddress, await user.getAddress(), 1, 1);

      // Verify the GToken minting process
      const gTokenBalance = await gTokens.balanceOf(await user.getAddress(), 1);
      expect(gTokenBalance).to.equal(1);
    });

    it("Should mint GTokens with correct attributes", async function () {
      const { governance, gTokens, validPayment, user } = await loadFixture(deployGovernanceFixture);

      const epochsLocked = 149;
      await governance.connect(user).enterGovernance([validPayment], epochsLocked);

      const { attributes } = await gTokens.getBalanceAt(user, 1);
      const [lpPayment] = attributes.lpPayments;

      expect(attributes.rewardPerShare).to.equal(0);
      expect(attributes.epochStaked).to.equal(0);
      expect(attributes.stakeWeight).to.gt(0);
      expect(attributes.epochsLocked).to.equal(epochsLocked);
      expect(attributes.lpAmount).to.equal(validPayment.amount);

      expect(lpPayment.token).to.be.equal(validPayment.token);
      expect(lpPayment.nonce).to.be.equal(validPayment.nonce);
      expect(lpPayment.amount).to.be.equal(validPayment.amount);
    });

    it("Should revert if LP token payment is invalid", async function () {
      const { governance, user } = await loadFixture(deployGovernanceFixture);
      const invalidPayment = {
        nonce: 0,
        token: ZeroAddress,
        amount: ethers.parseEther("1"),
      };

      await expect(governance.connect(user).enterGovernance([invalidPayment], 10)).to.be.revertedWith(
        "Governance: Invalid LpPayments sent",
      );
    });
  });

  describe("receiveRewards", function () {
    const REWARD_AMOUNT = parseEther("8265.09877");

    it("should receive rewards from the owner and update rewardPerShare correctly when totalStakeWeight is greater than zero", async function () {
      const {
        owner,
        user,
        adexToken: token,
        governance,
        enterGovernance,
        validPayment,
      } = await loadFixture(deployGovernanceFixture);

      // Assume some GTokens have been staked
      await enterGovernance(user, [validPayment], 120);

      // Define a valid TokenPayment
      const payment = {
        token,
        amount: REWARD_AMOUNT,
        nonce: 0,
      };

      // Approve the governance contract to transfer tokens
      await token.connect(owner).approve(governance, REWARD_AMOUNT);

      // Call receiveRewards as the owner
      await governance.connect(owner).receiveRewards(payment);

      // Check that the rewardPerShare was updated correctly
      const rewardPerShare = await governance.rewardPerShare();
      expect(rewardPerShare).to.be.gt(0);

      // Check that the rewardsReserve was updated correctly
      const rewardsReserve = await governance.rewardsReserve();
      const protocolFees = await governance.protocolFees();
      expect(rewardsReserve + protocolFees).to.equal(REWARD_AMOUNT);
    });

    it("should not update rewardPerShare if totalStakeWeight is zero", async function () {
      const { owner, adexToken: token, governance } = await loadFixture(deployGovernanceFixture);

      const payment = {
        token,
        amount: REWARD_AMOUNT,
        nonce: 0,
      };

      // Approve the governance contract to transfer tokens
      await token.connect(owner).approve(governance, REWARD_AMOUNT);

      // Call receiveRewards as the owner
      await governance.connect(owner).receiveRewards(payment);

      // Check that the rewardPerShare was not updated
      const rewardPerShare = await governance.rewardPerShare();
      expect(rewardPerShare).to.equal(0);

      // Check that the rewardsReserve was updated correctly
      const rewardsReserve = await governance.rewardsReserve();
      const protocolFees = await governance.protocolFees();
      expect(rewardsReserve + protocolFees).to.equal(REWARD_AMOUNT);
    });

    it("should revert if the reward amount is zero", async function () {
      const { owner, adexToken: token, governance } = await loadFixture(deployGovernanceFixture);

      const payment = {
        token,
        amount: 0,
        nonce: 0,
      };

      await expect(governance.connect(owner).receiveRewards(payment)).to.be.revertedWith(
        "Governance: Reward amount must be greater than zero",
      );
    });

    it("should revert if the payment token is invalid", async function () {
      const { owner, governance } = await loadFixture(deployGovernanceFixture);

      const payment = {
        token: ZeroAddress,
        amount: REWARD_AMOUNT,
        nonce: 0,
      };

      await expect(governance.connect(owner).receiveRewards(payment)).to.be.revertedWith(
        "Governance: Invalid reward payment",
      );
    });
  });

  describe("claimRewards", function () {
    it("should claim rewards in GToken and lpToken", async function () {
      const {
        lpTokenContract,
        pairContract,
        basePairContract,
        pairTradeToken,
        addLiquidity,
        user,
        owner,
        sellToken,
        otherUsers: [, , trader],
        governanceContract,
        adex: adexToken,
      } = await loadFixture(claimRewardsFixture);

      // User adds liquidity
      await addLiquidity(
        { tradeToken: pairTradeToken, contract: pairContract, signer: user },
        { token: pairTradeToken, nonce: 0, amount: parseEther("0.000000099004") },
      );
      await addLiquidity(
        { tradeToken: adexToken, contract: basePairContract, signer: user },
        { token: adexToken, nonce: 0, amount: parseEther("874.9904") },
      );

      // Trader sells different tokens to initiate rewards generation
      for (let i = 0; i < 4; i++) {
        let mintForAdex = false;
        await sellToken({
          buyContract: pairContract,
          sellAmt: await (async () => {
            let sellAmt = await adexToken.balanceOf(trader);

            if (sellAmt <= 0) {
              mintForAdex = true;
              sellAmt = parseEther("234.453");
            }

            return sellAmt;
          })(),
          sellContract: basePairContract,
          someUser: trader,
          slippage: 100_00,
          mint: mintForAdex,
        });
        await sellToken({
          buyContract: basePairContract,
          sellAmt: await pairTradeToken.balanceOf(trader),
          sellContract: pairContract,
          someUser: trader,
          slippage: 100_00,
        });
      }

      // User enters governance
      const lpContractAddr = await lpTokenContract.getAddress();
      const lpPayments: TokenPaymentStruct[] = await lpTokenContract
        .lpBalanceOf(user)
        .then(balances => balances.map(({ amount, nonce }) => ({ amount, nonce, token: lpContractAddr })));
      await lpTokenContract.setApprovalForAll(governanceContract, true);
      await governanceContract.connect(user).enterGovernance(lpPayments, 120);

      // Move forward in time to generate rewards
      await time.increase(30 * 24 * 3600);

      // User claims rewards from governance
      const initialUserBalance = await adexToken.balanceOf(user);

      // This will claim only lpRewards
      await governanceContract.connect(user).claimRewards(1);
      // Move forward in time to generate more  rewards
      await time.increase(30 * 24 * 3600);
      // This should claim both lpReewards and Governance rewards
      await governanceContract.connect(user).claimRewards(2);

      const finalUserBalance = await adexToken.balanceOf(user);
      const claimedRewards = finalUserBalance - initialUserBalance;

      // Assertions
      expect(claimedRewards).to.be.gt(0, "Rewards should be greater than zero");

      // Check protocol fees withdrawal
      expect(await governanceContract.protocolFees()).to.be.gt(0);
      const initialAdexBal = await adexToken.balanceOf(owner);
      await governanceContract.connect(owner).takeProtocolFees();
      const finalAdexBal = await adexToken.balanceOf(owner);
      expect(finalAdexBal).to.be.gt(initialAdexBal);
      expect(await governanceContract.protocolFees()).to.be.eq(0);
    });
  });

  describe("exitGovernance", function () {
    it("should exit governance before lock epochs elapse, returning locked LP tokens correctly", async function () {
      const {
        addLiquidityAndEnterGovernance,
        governanceContract,
        user,
        lpTokenContract,
        epochLength,
        computeLpBalance,
      } = await loadFixture(claimRewardsFixture);

      const initialLpTokens = await addLiquidityAndEnterGovernance(1);

      // Move forward in time, but not enough to elapse lock epochs
      await time.increase(Math.floor(+(epochLength / 100n).toString()));

      // User exits governance
      await governanceContract.connect(user).exitGovernance(1);
      const finalLpTokens = await lpTokenContract.lpBalanceOf(user);

      // Assertions
      expect(finalLpTokens[0].amount).to.be.gt(0, "Must return some LP amount");
      expect(computeLpBalance(finalLpTokens)).to.be.lt(
        computeLpBalance(initialLpTokens),
        "Some LP amounts should be forfeited for early unstake",
      );
    });

    it("should exit governance after lock epochs elapse, returning all staked LP tokens", async function () {
      const {
        addLiquidityAndEnterGovernance,
        governanceContract,
        user,
        lpTokenContract,
        epochLength,
        computeLpBalance,
      } = await loadFixture(claimRewardsFixture);

      const initialLpTokens = await addLiquidityAndEnterGovernance(1);

      // Move forward in time to elapse lock epochs
      await time.increase(1090n * epochLength); // 1090 epochs (more than the lock period)

      // User exits governance
      await governanceContract.connect(user).exitGovernance(1);
      const finalLpTokens = await lpTokenContract.lpBalanceOf(user);

      // Assertions
      expect(computeLpBalance(finalLpTokens)).to.be.equal(
        computeLpBalance(initialLpTokens),
        "All LP tokens should be returned after lock epochs elapse",
      );
      expect(initialLpTokens.length).to.equal(
        finalLpTokens.length,
        "All LP tokens should be returned after lock epochs elapse",
      );
    });

    it("should correctly handle multiple liquidity positions during governance exit", async function () {
      const { addLiquidityAndEnterGovernance, governanceContract, user, epochLength } =
        await loadFixture(claimRewardsFixture);

      await addLiquidityAndEnterGovernance(4);

      // Move forward in time to elapse lock epochs
      await time.increase(1090n * epochLength); // 1090 days (more than the lock period)

      // User exits governance
      await governanceContract.connect(user).exitGovernance(1);
    });
  });

  async function proposeNewPairListingFixture() {
    const {
      governanceContract,
      gTokens,
      otherUsers: [pairOwner, ...otherUsers],
      lpTokenContract,
      adex: listingFeeToken,
      basePairContract,
      addLiquidity,
      LISTING_FEE,
      ...fixtures
    } = await claimRewardsFixture();

    const proposeNewPairListing = async () => {
      const tradeToken = await ethers.deployContract("MintableERC20", ["NewPairTrade", "TRKJ"], { signer: pairOwner });

      // Prepare listing fee payment and GToken payment
      const listingFeePayment = {
        token: listingFeeToken,
        amount: LISTING_FEE,
        nonce: 0,
      };
      // Approve the listing fee payment
      await listingFeeToken.mint(pairOwner, listingFeePayment.amount);
      await listingFeeToken.connect(pairOwner).approve(governanceContract, listingFeePayment.amount);

      const tradeTokenPayment = {
        token: tradeToken,
        amount: parseEther("123455"),
        nonce: 0,
      };
      // Approve the listing fee payment
      await tradeToken.mint(pairOwner, tradeTokenPayment.amount);
      await tradeToken.connect(pairOwner).approve(governanceContract, tradeTokenPayment.amount);

      // Enter governance to create GToken balance
      await addLiquidity(
        { contract: basePairContract, tradeToken: listingFeeToken, signer: pairOwner },
        { token: listingFeeToken, nonce: 0, amount: parseEther("1000") },
      );
      const lpBalance = (await lpTokenContract.lpBalanceOf(pairOwner)).at(-1)!;
      const securityLpPayment = {
        token: lpTokenContract,
        amount: lpBalance.amount,
        nonce: lpBalance.nonce,
      };
      await lpTokenContract.connect(pairOwner).setApprovalForAll(governanceContract, true);

      // Propose new pair listing
      await governanceContract
        .connect(pairOwner)
        .proposeNewPairListing(listingFeePayment, securityLpPayment, tradeTokenPayment);

      // Validate that the listing was proposed correctly
      const activeListing = await governanceContract.activeListing();
      expect(activeListing.owner).to.equal(pairOwner);
      expect(activeListing.tradeTokenPayment.token).to.equal(await tradeToken.getAddress());
      expect(activeListing.securityLpPayment.nonce).to.equal(securityLpPayment.nonce);

      return tradeToken;
    };

    const newTradeToken = await proposeNewPairListing();
    return {
      ...fixtures,
      lpTokenContract,
      governanceContract,
      gTokens,
      otherUsers,
      pairOwner,
      newTradeToken,
      vote: async <VoteToken extends { amount: BigNumberish; nonce: BigNumberish }>(
        voteTokens: VoteToken[],
        voter: HardhatEthersSigner,
        shouldList: boolean,
      ) => {
        await gTokens.connect(voter).setApprovalForAll(governanceContract, true);
        for (const voteToken of voteTokens) {
          await governanceContract
            .connect(voter)
            .vote({ token: gTokens, nonce: voteToken.nonce, amount: voteToken.amount }, newTradeToken, shouldList);
        }
      },
    };
  }

  describe("progressNewPairListing", function () {
    it("Should revert if no listing is found for the sender", async function () {
      const {
        governanceContract,
        otherUsers: [someUser],
        epochLength,
      } = await loadFixture(proposeNewPairListingFixture);
      await time.increase(epochLength * 8n);

      await expect(governanceContract.connect(someUser).progressNewPairListing()).to.be.revertedWith(
        "No listing found",
      );
    });

    it("Should return security deposit if proposal does not pass", async function () {
      const {
        governanceContract,
        gTokens,
        addLiquidityAndEnterGovernance,
        otherUsers: [largeVoter, smallVoter],
        newTradeToken,
        epochLength,
        pairOwner,
        lpTokenContract,
      } = await loadFixture(proposeNewPairListingFixture);
      await addLiquidityAndEnterGovernance(1, largeVoter, {
        adexAmount: parseEther("736365"),
        otherPairAmount: parseEther("0.00009"),
        epochsLocked: 1080,
      });
      await addLiquidityAndEnterGovernance(1, smallVoter, {
        otherPairAmount: parseEther("0.00000000009"),
        epochsLocked: 1080,
        adexAmount: parseEther("0.000363"),
      });

      const [voteToken] = await gTokens.getGTokenBalance(smallVoter);
      await gTokens.connect(smallVoter).setApprovalForAll(governanceContract, true);
      await governanceContract
        .connect(smallVoter)
        .vote({ token: gTokens, nonce: voteToken.nonce, amount: voteToken.amount }, newTradeToken, true);

      await time.increase(epochLength * 8n);
      const expectedSecurityLpPayment = (await governanceContract.activeListing()).securityLpPayment;
      await governanceContract.connect(pairOwner).progressNewPairListing();

      expect((await governanceContract.activeListing()).owner).to.be.eq(ZeroAddress);
      expect((await governanceContract.pairOwnerListing(pairOwner)).owner).to.be.eq(ZeroAddress);
      expect(await lpTokenContract.hasSFT(pairOwner, expectedSecurityLpPayment.nonce)).to.be.eq(
        true,
        "Security deposit must be returned",
      );
    });

    it("Should proceed to the next stage if proposal passes", async function () {
      const {
        governanceContract,
        gTokens,
        addLiquidityAndEnterGovernance,
        otherUsers: [voter],
        newTradeToken,
        epochLength,
        pairOwner,
        launchPairContract,
      } = await loadFixture(proposeNewPairListingFixture);

      await addLiquidityAndEnterGovernance(1, voter, {
        epochsLocked: 1080,
        adexAmount: parseEther("123456"),
        otherPairAmount: parseEther("0.0000000000999"),
      });
      const voteTokens = await gTokens.getGTokenBalance(voter);

      await gTokens.connect(voter).setApprovalForAll(governanceContract, true);
      for (const voteToken of voteTokens) {
        await governanceContract
          .connect(voter)
          .vote({ token: gTokens, nonce: voteToken.nonce, amount: voteToken.amount }, newTradeToken, true);
      }

      await time.increase(epochLength * 8n);
      await governanceContract.connect(pairOwner).progressNewPairListing();

      const { campaignId } = await governanceContract.pairOwnerListing(pairOwner);
      expect(campaignId).to.be.gt(0);
      expect((await launchPairContract.campaigns(campaignId)).creator).to.be.equal(pairOwner.address);
    });

    it("Should fail the listing if the campaign is unsuccessful", async function () {
      const {
        governanceContract,
        gTokens,
        addLiquidityAndEnterGovernance,
        otherUsers: [voter],
        newTradeToken,
        epochLength,
        pairOwner,
        launchPairContract,
        lpTokenContract,
      } = await loadFixture(proposeNewPairListingFixture);

      await addLiquidityAndEnterGovernance(1, voter, {
        epochsLocked: 1080,
        adexAmount: parseEther("123456"),
        otherPairAmount: parseEther("0.0000000000999"),
      });
      const voteTokens = await gTokens.getGTokenBalance(voter);

      await gTokens.connect(voter).setApprovalForAll(governanceContract, true);
      for (const voteToken of voteTokens) {
        await governanceContract
          .connect(voter)
          .vote({ token: gTokens, nonce: voteToken.nonce, amount: voteToken.amount }, newTradeToken, true);
      }

      await time.increase(epochLength * 8n);
      await governanceContract.connect(pairOwner).progressNewPairListing();

      const { campaignId, securityLpPayment } = await governanceContract.pairOwnerListing(pairOwner);
      expect(campaignId).to.be.gt(0);
      await launchPairContract.connect(pairOwner).startCampaign(parseEther("0.34434"), 34, campaignId);
      await time.increase(4774);

      await governanceContract.connect(pairOwner).progressNewPairListing();

      await expect(governanceContract.connect(pairOwner).progressNewPairListing()).to.be.revertedWith(
        "No listing found",
      );

      expect((await governanceContract.pairOwnerListing(pairOwner)).owner).to.be.eq(ZeroAddress);
      expect(await lpTokenContract.hasSFT(pairOwner, securityLpPayment.nonce)).to.be.eq(
        true,
        "Security deposit must be returned",
      );
    });

    it("Should fail if trying to progress when funds are not withdrawn", async function () {
      const {
        governanceContract,
        gTokens,
        addLiquidityAndEnterGovernance,
        otherUsers: [voter],
        newTradeToken,
        epochLength,
        pairOwner,
      } = await loadFixture(proposeNewPairListingFixture);

      await addLiquidityAndEnterGovernance(1, voter, {
        epochsLocked: 1080,
        adexAmount: parseEther("123456"),
        otherPairAmount: parseEther("0.0000000000999"),
      });
      const voteTokens = await gTokens.getGTokenBalance(voter);

      await gTokens.connect(voter).setApprovalForAll(governanceContract, true);
      for (const voteToken of voteTokens) {
        await governanceContract
          .connect(voter)
          .vote({ token: gTokens, nonce: voteToken.nonce, amount: voteToken.amount }, newTradeToken, true);
      }

      await time.increase(epochLength * 8n);
      await governanceContract.connect(pairOwner).progressNewPairListing();

      const { campaignId } = await governanceContract.pairOwnerListing(pairOwner);
      expect(campaignId).to.be.gt(0);

      await expect(governanceContract.connect(pairOwner).progressNewPairListing()).to.be.revertedWith(
        "Governance: Funding not complete",
      );
    });

    it("Should add liquidity and distribute GToken if the campaign is successful", async function () {
      const {
        governanceContract,
        gTokens,
        addLiquidityAndEnterGovernance,
        otherUsers: [voter, lpHaunter1, lpHaunter2],
        newTradeToken,
        epochLength,
        pairOwner,
        launchPairContract,
        lpTokenContract,
        router,
      } = await loadFixture(proposeNewPairListingFixture);
      // Create EDU Pair
      await router.createPair({ token: ZeroAddress, amount: 0, nonce: 0 }, { value: parseEther("0.93645") });

      await addLiquidityAndEnterGovernance(1, voter, {
        epochsLocked: 1080,
        adexAmount: parseEther("123456"),
        otherPairAmount: parseEther("0.0000000000999"),
      });
      const voteTokens = await gTokens.getGTokenBalance(voter);

      await gTokens.connect(voter).setApprovalForAll(governanceContract, true);
      for (const voteToken of voteTokens) {
        await governanceContract
          .connect(voter)
          .vote({ token: gTokens, nonce: voteToken.nonce, amount: voteToken.amount }, newTradeToken, true);
      }
      await time.increase(epochLength * 8n);
      await governanceContract.connect(pairOwner).progressNewPairListing();

      const { campaignId, securityLpPayment, tradeTokenPayment } = await governanceContract.pairOwnerListing(pairOwner);
      expect(campaignId).to.be.gt(0);
      await launchPairContract.connect(pairOwner).startCampaign(parseEther("0.000345"), 3600, campaignId);
      const campaign = await launchPairContract.campaigns(campaignId);

      await launchPairContract.connect(lpHaunter1).contribute(campaignId, { value: campaign.goal / 2n });
      await launchPairContract.connect(lpHaunter2).contribute(campaignId, { value: campaign.goal });

      await time.increase(30 * 3600);

      // This will create locked GToken
      await governanceContract.connect(pairOwner).progressNewPairListing();
      const recentGToken = (await gTokens.getGTokenBalance(pairOwner)).at(-1)!;
      expect(recentGToken.attributes.epochsLocked).to.equal(1080, "Generated GTokens must be locked at max epochs");
      expect(recentGToken.attributes.lpPayments.length).to.eq(2, "Two lpPaymnets should be in the GToken");
      expect(recentGToken.attributes.lpPayments[0].nonce).to.eq(
        securityLpPayment.nonce,
        "Security LP paymnet must be part of the GTokne minted",
      );

      expect((await governanceContract.activeListing()).owner).to.be.eq(ZeroAddress);

      // This will create pair and activate trading
      await governanceContract.connect(pairOwner).progressNewPairListing();
      expect((await router.tradeableTokens()).includes(tradeTokenPayment.token)).to.equal(
        true,
        "tradeTokenPayment token should be listed",
      );

      expect(
        (await lpTokenContract.getNonces(lpHaunter1)).length + (await lpTokenContract.getNonces(lpHaunter2)).length,
      ).to.eq(0);
      await launchPairContract.connect(lpHaunter1).withdrawLaunchPairToken(campaignId);
      await launchPairContract.connect(lpHaunter2).withdrawLaunchPairToken(campaignId);
      expect(
        (await lpTokenContract.getNonces(lpHaunter1)).length + (await lpTokenContract.getNonces(lpHaunter2)).length,
      ).to.eq(2);
    });
  });

  describe.skip("vote", function () {
    it("Should revert if the trade token is not active", async function () {
      const { governanceContract, gTokens, pairTradeToken } = await loadFixture(proposeNewPairListingFixture);
      await expect(
        governanceContract.vote({ token: gTokens, nonce: 1, amount: parseEther("100") }, "0xInvalidTokenAddress", true),
      ).to.be.revertedWith("Token not active");
    });

    it("Should revert if the gToken payment is invalid", async function () {
      const { governanceContract, gTokens, pairTradeToken } = await loadFixture(proposeNewPairListingFixture);
      await expect(
        governanceContract.vote(
          { token: "0xInvalidTokenAddress", nonce: 1, amount: parseEther("100") },
          pairTradeToken,
          true,
        ),
      ).to.be.revertedWith("Governance: Invalid Payment");
    });

    it("Should correctly register a user's vote", async function () {
      const { governanceContract, gTokens, pairTradeToken } = await loadFixture(proposeNewPairListingFixture);
      await governanceContract.vote({ token: gTokens, nonce: 1, amount: parseEther("100") }, pairTradeToken, true);

      const activeListing = await governanceContract.activeListing();
      expect(activeListing.yesVote).to.equal(parseEther("100"));
    });

    it("Should increase total LP amount after voting", async function () {
      const { governanceContract, gTokens, pairTradeToken } = await loadFixture(proposeNewPairListingFixture);
      await governanceContract.vote({ token: gTokens, nonce: 1, amount: parseEther("100") }, pairTradeToken, true);

      const activeListing = await governanceContract.activeListing();
      expect(activeListing.totalLpAmount).to.equal(parseEther("100"));
    });
  });

  describe("recallVoteToken", function () {
    it("Should revert if the user has no votes to recall", async function () {
      const {
        governanceContract,
        gTokens,
        otherUsers: [voter],
        vote,
        addLiquidityAndEnterGovernance,
        epochLength,
      } = await loadFixture(proposeNewPairListingFixture);

      // Get multiple GTokens
      for (let i = 0; i < 5; i++) {
        await addLiquidityAndEnterGovernance(4, voter, {
          epochsLocked: 1080,
          adexAmount: parseEther("1000"),
          otherPairAmount: parseEther("0.00009"),
        });
        await addLiquidityAndEnterGovernance(2, voter, {
          epochsLocked: 1080,
          adexAmount: parseEther("1000"),
          otherPairAmount: parseEther("0.00009"),
        });
        await addLiquidityAndEnterGovernance(1, voter, {
          epochsLocked: 1080,
          adexAmount: parseEther("1000"),
          otherPairAmount: parseEther("0.00009"),
        });
      }
      await vote(await gTokens.getGTokenBalance(voter), voter, false);

      await time.increase(epochLength * 100n);

      await expect(governanceContract.connect(voter).recallVoteToken()).to.not.be.reverted;
      await expect(governanceContract.connect(voter).recallVoteToken()).to.not.be.reverted;
      await expect(governanceContract.connect(voter).recallVoteToken()).to.be.revertedWith("No vote found");
    });
  });
});

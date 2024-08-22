import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers } from "hardhat";
import { expect } from "chai";
import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers";
import { parseEther, ZeroAddress } from "ethers";

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
    await lpToken.mint(0, 10_000, ZeroAddress, user, 0);

    // Deploy the Governance contract
    const GovernanceFactory = await ethers.getContractFactory("Governance");
    const governance = await GovernanceFactory.deploy(await lpToken.getAddress(), await adexToken.getAddress(), {
      epochLength: 24 * 60 * 60,
      genesis: await time.latest(),
    });
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
      expect(rewardsReserve).to.equal(REWARD_AMOUNT);
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
      expect(rewardsReserve).to.equal(REWARD_AMOUNT);
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

      await expect(governance.connect(owner).receiveRewards(payment)).to.be.revertedWith("Governance: Invalid payment");
    });
  });
});

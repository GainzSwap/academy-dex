import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers } from "hardhat";
import { expect, use } from "chai";
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
    const GovernanceFactory = await ethers.getContractFactory("Governance");
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
        adex: adexTokenContract,
      } = await loadFixture(claimRewardsFixture);

      // User adds liquidity
      await addLiquidity(
        { tradeToken: pairTradeToken, contract: pairContract, signer: user },
        { token: pairTradeToken, amount: parseEther("483.99004") },
      );
      await addLiquidity(
        { tradeToken: adexTokenContract, contract: basePairContract, signer: user },
        { token: adexTokenContract, amount: parseEther("874.9904") },
      );

      // Trader sells different tokens to initiate rewards generation
      for (let i = 0; i < 4; i++) {
        let mintForAdex = false;
        await sellToken({
          buyContract: pairContract,
          sellAmt: await (async () => {
            let sellAmt = await adexTokenContract.balanceOf(trader);

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
      const initialUserBalance = await adexTokenContract.balanceOf(user);

      // This will claim only lpRewards
      await governanceContract.connect(user).claimRewards(1);
      // Move forward in time to generate more  rewards
      await time.increase(30 * 24 * 3600);
      // This should claim both lpReewards and Governance rewards
      await governanceContract.connect(user).claimRewards(2);

      const finalUserBalance = await adexTokenContract.balanceOf(user);
      const claimedRewards = finalUserBalance - initialUserBalance;

      // Assertions
      expect(claimedRewards).to.be.gt(0, "Rewards should be greater than zero");

      // Check protocol fees withdrawal
      expect(await governanceContract.protocolFees()).to.be.gt(0);
      const initialAdexBal = await adexTokenContract.balanceOf(owner);
      await governanceContract.connect(owner).takeProtocolFees();
      const finalAdexBal = await adexTokenContract.balanceOf(owner);
      expect(finalAdexBal).to.be.gt(initialAdexBal);
      expect(await governanceContract.protocolFees()).to.be.eq(0);
    });
  });

  describe("exitGovernance", function () {
    async function exitGovernanceFixture() {
      const { governanceContract, ...fixtures } = await claimRewardsFixture();

      return {
        ...fixtures,
        governanceContract,
        epochLength: (await governanceContract.epochs()).epochLength,
      };
    }
    it("should exit governance before lock epochs elapse, returning locked LP tokens correctly", async function () {
      const {
        addLiquidityAndEnterGovernance,
        governanceContract,
        user,
        lpTokenContract,
        epochLength,
        computeLpBalance,
      } = await loadFixture(exitGovernanceFixture);

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
      } = await loadFixture(exitGovernanceFixture);

      const initialLpTokens = await addLiquidityAndEnterGovernance(1);

      // Move forward in time to elapse lock epochs
      await time.increase(130n * epochLength); // 130 epochs (more than the lock period)

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
        await loadFixture(exitGovernanceFixture);

      await addLiquidityAndEnterGovernance(4);

      // Move forward in time to elapse lock epochs
      await time.increase(130n * epochLength); // 130 days (more than the lock period)

      // User exits governance
      await governanceContract.connect(user).exitGovernance(1);
    });
  });

  describe("proposeNewPairListing", function () {
    it("should propose a new pair listing", async function () {
      const {
        governanceContract,
        gTokens,
        otherUsers: [, , , pairOwner],
        adex: listingFeeToken,
        addLiquidityAndEnterGovernance,
        LISTING_FEE,
      } = await loadFixture(claimRewardsFixture);

      const tradeToken = await ethers.deployContract("MintableERC20", ["NewPairTrade", "TRKJ"], { signer: pairOwner });

      // Prepare listing fee payment and GToken payment
      const listingFeePayment = {
        token: listingFeeToken,
        amount: LISTING_FEE,
        nonce: 0,
      };
      // Approve the listing fee payment
      listingFeeToken.mint(pairOwner, LISTING_FEE);
      await listingFeeToken.connect(pairOwner).approve(governanceContract, listingFeePayment.amount);

      // Enter governance to create GToken balance
      await addLiquidityAndEnterGovernance(3, pairOwner);
      const [gTokenBalance1] = await gTokens.getGTokenBalance(pairOwner);
      const gTokenPayment = {
        token: gTokens,
        amount: gTokenBalance1.amount,
        nonce: gTokenBalance1.nonce,
      };
      await gTokens.connect(pairOwner).setApprovalForAll(governanceContract, true);

      // Propose new pair listing
      await governanceContract.connect(pairOwner).proposeNewPairListing(listingFeePayment, gTokenPayment, tradeToken);

      // Validate that the listing was proposed correctly
      const activeListing = await governanceContract.activeListing();
      expect(activeListing.owner).to.equal(pairOwner);
      expect(activeListing.tradeToken).to.equal(tradeToken);
      expect(activeListing.gTokenNonce).to.equal(gTokenPayment.nonce);
    });

    it.skip("should revert if the previous proposal is not completed", async function () {
      const { governanceContract, gtokens, lpTokenContract, user, tradeToken, listingFeeToken, LISTING_FEE } =
        await loadFixture(governanceFixture);

      // Approve the listing fee payment
      await listingFeeToken.connect(user).approve(governanceContract, LISTING_FEE);

      // Prepare listing fee payment and GToken payment
      const listingFeePayment = {
        token: listingFeeToken,
        amount: LISTING_FEE,
      };
      const gTokenPayment = {
        token: gtokens,
        amount: parseEther("100"),
        nonce: 1, // example nonce
      };

      // Enter governance to create GToken balance
      await lpTokenContract.connect(user).setApprovalForAll(governanceContract, true);
      await governanceContract
        .connect(user)
        .enterGovernance([{ amount: parseEther("1000"), nonce: 1, token: lpTokenContract }], 120);

      // Propose the first pair listing
      await governanceContract.connect(user).proposeNewPairListing(listingFeePayment, gTokenPayment, tradeToken);

      // Attempt to propose another pair listing before completing the first
      await expect(
        governanceContract.connect(user).proposeNewPairListing(listingFeePayment, gTokenPayment, tradeToken),
      ).to.be.revertedWith("Governance: Previous proposal not completed");
    });

    it.skip("should revert if the GToken payment is invalid", async function () {
      const { governanceContract, gtokens, user, tradeToken, listingFeeToken, LISTING_FEE } =
        await loadFixture(governanceFixture);

      // Approve the listing fee payment
      await listingFeeToken.connect(user).approve(governanceContract, LISTING_FEE);

      // Prepare listing fee payment with an invalid GToken payment
      const listingFeePayment = {
        token: listingFeeToken,
        amount: LISTING_FEE,
      };
      const gTokenPayment = {
        token: gtokens,
        amount: parseEther("10"), // insufficient amount for listing
        nonce: 1,
      };

      // Attempt to propose the pair listing with invalid GToken payment
      await expect(
        governanceContract.connect(user).proposeNewPairListing(listingFeePayment, gTokenPayment, tradeToken),
      ).to.be.revertedWith("Governance: Invalid GToken Payment");
    });
  });
});

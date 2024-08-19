import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture, time } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { AddressLike, Addressable, parseEther, Typed, BigNumberish } from "ethers";
import deployRouterFixture from "./deployRouterFixture";

describe("Router", function () {
  describe("addLiquidity", function () {
    it("should add liquidity to a pair", async function () {
      const { basePairContract, baseTradeToken, user, addLiquidity, createPair, owner, lpTokenContract } =
        await loadFixture(deployRouterFixture);

      const { pairContract, pairTradeToken } = await createPair();

      const basePaymentAmount = ethers.parseEther("1");
      const pairPaymentAmount = ethers.parseEther("1");

      // Mint tokens for liquidity
      await baseTradeToken.connect(owner).transfer(user, basePaymentAmount);
      await pairTradeToken.mint(user, pairPaymentAmount);

      const basePayment = { amount: basePaymentAmount, token: baseTradeToken };
      const pairPayment = { amount: pairPaymentAmount, token: pairTradeToken };

      // Add liquidity to the base pair
      const initialAdexBal = await baseTradeToken.balanceOf(basePairContract);
      await addLiquidity({ contract: basePairContract, tradeToken: baseTradeToken }, basePayment);
      expect(await basePairContract.reserve()).to.equal(basePayment.amount);

      // Add liquidity to the created pair
      await addLiquidity({ contract: pairContract, tradeToken: pairTradeToken }, pairPayment);
      expect(await pairContract.reserve()).to.equal(pairPayment.amount);

      // Check that the liquidity was correctly added to the contract's balance
      expect(await baseTradeToken.balanceOf(basePairContract)).to.equal(basePayment.amount + initialAdexBal);
      expect(await pairTradeToken.balanceOf(pairContract)).to.equal(pairPayment.amount);

      // LP token should be minted
      const [lpOne, lpTwo, ...otherLps] = await lpTokenContract.lpBalanceOf(user);
      expect(otherLps.length).to.equal(0);

      expect(lpOne.amount > 0).to.equal(true);
      expect(lpOne.attributes.pair).to.equal(basePairContract);

      expect(lpTwo.amount > 0).to.equal(true);
      expect(lpTwo.attributes.pair).to.equal(pairContract);
    });

    it("should fail to add liquidity if the pair does not exist", async function () {
      const {
        router,
        user,
        otherUsers: [, , notPair],
      } = await loadFixture(deployRouterFixture);

      const payment = { amount: ethers.parseEther("1"), token: notPair };

      await expect(router.connect(user).addLiquidity(payment)).to.be.revertedWith("Router: Invalid pair address");
    });

    it("should revert if liquidity amount is zero", async function () {
      const { basePairContract, baseTradeToken, addLiquidity } = await loadFixture(deployRouterFixture);

      const basePayment = { amount: ethers.parseEther("0"), token: baseTradeToken };

      await expect(
        addLiquidity({ contract: basePairContract, tradeToken: baseTradeToken }, basePayment),
      ).to.be.revertedWith("Pair: Bad received payment");
    });

    it("should generate rewards after adding liquidity", async function () {
      const { basePairContract, baseTradeToken, user, addLiquidity, createPair, owner, router, sellToken } =
        await loadFixture(deployRouterFixture);

      const { pairContract: firstPairContract, pairTradeToken: firstPairTradeToken } = await createPair();

      const basePaymentAmount = ethers.parseEther("1");
      const pairPaymentAmount = ethers.parseEther("1");

      // Mint tokens for liquidity
      await baseTradeToken.connect(owner).transfer(user, basePaymentAmount);
      await firstPairTradeToken.mint(user, pairPaymentAmount);

      const basePayment = { amount: basePaymentAmount, token: baseTradeToken };
      const pairPayment = { amount: pairPaymentAmount, token: firstPairTradeToken };

      await addLiquidity({ contract: basePairContract, tradeToken: baseTradeToken }, basePayment);
      await addLiquidity({ contract: firstPairContract, tradeToken: firstPairTradeToken }, pairPayment);

      expect(await router.getClaimableRewards(user)).to.be.equal(0);

      await sellToken({
        buyContract: basePairContract,
        sellContract: firstPairContract,
        sellAmt: parseEther("0.00015"),
        mint: true,
      });

      await time.increase(1);
      expect(await router.getClaimableRewards(user)).to.be.greaterThan(0);

      const { pairContract: secondPairContract, pairTradeToken: secondPairTradeToken } = await createPair();
      const amount = parseEther("89.4");
      await secondPairTradeToken.mint(user, amount);
      await addLiquidity(
        { contract: secondPairContract, tradeToken: secondPairTradeToken },
        { amount, token: secondPairTradeToken },
      );

      await time.increase(10);
      const gainAfterSmallTime = await router.getClaimableRewards(user);
      expect(gainAfterSmallTime).to.be.greaterThan(0);

      await time.increase(1_000_000);
      expect((await router.getClaimableRewards(user)) - gainAfterSmallTime).to.be.greaterThan(0);
    });
  });

  describe("Fee Calculation and Distribution", function () {
    it("should correctly calculate fees for Base LPs and Referrer", async function () {
      const {
        baseTradeToken,
        basePairContract,
        addLiquidity,
        createPair,
        router,
        owner,
        user,
        otherUsers: [, , , referred, referrer],
      } = await loadFixture(deployRouterFixture);

      const { pairContract: buyContract, pairTradeToken: buyToken } = await createPair();
      const { pairContract: sellContract, pairTradeToken: sellToken } = await createPair();

      // Add base liq, must do so that trading will occur
      await addLiquidity(
        { tradeToken: baseTradeToken, contract: basePairContract, signer: owner },
        { amount: parseEther("8274.4294279"), token: baseTradeToken },
      );

      const userLiq = { amount: parseEther("7487464.385"), token: buyToken };
      await buyToken.mint(user, userLiq.amount);
      await addLiquidity({ tradeToken: userLiq.token, contract: buyContract }, userLiq);

      userLiq.token = sellToken;
      await sellToken.mint(user, userLiq.amount);
      await addLiquidity({ tradeToken: userLiq.token, contract: sellContract }, userLiq);

      expect((await router.pairsData(basePairContract)).buyVolume).to.equal(0);

      const referrerInPayment = { token: buyToken, amount: parseEther("0.0024846") };
      await referrerInPayment.token.connect(owner).mint(referrer, referrerInPayment.amount);
      await referrerInPayment.token.connect(referrer).approve(buyContract, referrerInPayment.amount);
      await router.connect(referrer).registerAndSwap(0, referrerInPayment, sellContract, 1_00);

      expect(await buyToken.balanceOf(referrer)).to.equal(0);

      const referredInPayment = { token: sellToken, amount: parseEther("65.767") };
      await referredInPayment.token.connect(owner).mint(referred, referredInPayment.amount);
      await referredInPayment.token.connect(referred).approve(sellContract, referredInPayment.amount);
      await router.connect(referred).registerAndSwap(1, referredInPayment, buyContract, 1_00);

      // referrer receives trade fee
      expect(await buyToken.balanceOf(referrer)).to.be.greaterThan(0);
      expect((await router.pairsData(basePairContract)).buyVolume).to.be.greaterThan(0);
    });
  });

  describe("Router: claimRewards", function () {
    async function claimRewardsFixture() {
      const {
        router,
        user,
        basePairContract,
        createPair,
        baseTradeToken: adex,
        owner,
        addLiquidity,
        ...fixtures
      } = await loadFixture(deployRouterFixture);

      const { pairContract, pairTradeToken } = await createPair();

      const addInitialLiq = async ({ baseAmt, pairAmt }: { baseAmt: BigNumberish; pairAmt: BigNumberish }) => {
        const basePayment = { amount: baseAmt, token: adex };
        const pairPayment = { amount: pairAmt, token: pairTradeToken };

        await adex.connect(owner).transfer(user, baseAmt);
        const initialAdexBal = await adex.balanceOf(basePairContract);
        await addLiquidity({ contract: basePairContract, tradeToken: adex }, basePayment);
        expect(await basePairContract.reserve()).to.equal(basePayment.amount);

        await pairTradeToken.mint(user, pairAmt);
        await addLiquidity({ contract: pairContract, tradeToken: pairTradeToken }, pairPayment);
        expect(await pairContract.reserve()).to.equal(pairPayment.amount);

        expect(await adex.balanceOf(basePairContract)).to.equal(BigInt(basePayment.amount) + initialAdexBal);
        expect(await pairTradeToken.balanceOf(pairContract)).to.equal(pairPayment.amount);
      };

      await addInitialLiq({ baseAmt: parseEther("7284.4846"), pairAmt: parseEther("745334000.4746") });

      return { ...fixtures, adex, router, user, basePairContract, createPair, owner, pairContract, addLiquidity };
    }

    it("should allow users to claim rewards from a pair with valid nonces", async function () {
      const { router, basePairContract, user, pairContract, sellToken, adex } = await loadFixture(claimRewardsFixture);

      // Simulate trading activity to generate rewards
      await sellToken({
        buyContract: pairContract,
        sellAmt: ethers.parseEther("0.05"),
        sellContract: basePairContract,
        mint: true,
      });

      const nonces = [1, 2];

      // Claim rewards
      await router.connect(user).claimRewards(nonces);

      // Check user's balance after claiming rewards
      const balanceAfterClaim = await adex.balanceOf(user);
      expect(balanceAfterClaim).to.be.gt(0);
    });

    it("should revert if there are no rewards to claim", async function () {
      const { router, user } = await loadFixture(claimRewardsFixture);
      const nonces = [1];
      await expect(router.connect(user).claimRewards(nonces)).to.be.revertedWith("No rewards available to claim");
    });

    it("should correctly update LP attributes and pair data after claiming", async function () {
      const { router, basePairContract, createPair, user, addLiquidity, sellToken, lpTokenContract } =
        await loadFixture(claimRewardsFixture);

      const { pairContract, pairTradeToken } = await createPair();

      // Add liquidity and generate rewards
      await addLiquidity(
        { contract: pairContract, tradeToken: pairTradeToken },
        { token: pairTradeToken, amount: ethers.parseEther("0.1") },
      );
      await sellToken({
        buyContract: pairContract,
        sellAmt: ethers.parseEther("0.05"),
        sellContract: basePairContract,
        mint: true,
      });

      let nonces = (await lpTokenContract.getNonces(user)).map(val => val);

      // Get the initial state before claiming rewards
      const initialLpAttributes = await lpTokenContract.getBalanceAt(user, nonces[0]);
      const initialPairData = await router.pairsData(pairContract);

      // Claim rewards
      await router.connect(user).claimRewards(nonces);
      // Nonces update after claim
      nonces = (await lpTokenContract.getNonces(user)).map(val => val);

      // Check that LP attributes and pair data have been updated correctly
      const updatedLpAttributes = await lpTokenContract.getBalanceAt(user, nonces[0]);
      const updatedPairData = await router.pairsData(pairContract);

      expect(updatedLpAttributes.attributes).to.not.equal(initialLpAttributes.attributes);
      expect(updatedPairData).to.not.equal(initialPairData);
    });

    it("should transfer the correct amount of rewards to the user", async function () {
      const { router, basePairContract, createPair, user, addLiquidity, adex, sellToken } =
        await loadFixture(claimRewardsFixture);

      const { pairContract, pairTradeToken } = await createPair();

      // Add liquidity and generate rewards
      await addLiquidity(
        { contract: pairContract, tradeToken: pairTradeToken },
        { token: pairTradeToken, amount: ethers.parseEther("0.1") },
      );
      await sellToken({
        buyContract: pairContract,
        sellAmt: ethers.parseEther("0.05"),
        sellContract: basePairContract,
        mint: true,
      });

      const nonces = [1, 2]; // Valid nonce for the test

      // Claim rewards and check transfer
      const balanceBeforeClaim = await adex.balanceOf(user);

      await router.connect(user).claimRewards(nonces);

      const balanceAfterClaim = await adex.balanceOf(user);
      expect(balanceAfterClaim).to.be.greaterThan(balanceBeforeClaim);
    });
  });
});

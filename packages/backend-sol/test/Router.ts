import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture, time } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { parseEther, ZeroAddress } from "ethers";
import { deployRouterFixture, claimRewardsFixture } from "./fixtures";

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

      const basePayment = { amount: basePaymentAmount, nonce: 0, token: baseTradeToken };
      const pairPayment = { amount: pairPaymentAmount, nonce: 0, token: pairTradeToken };

      // Add liquidity to the base pair
      const initialAdexBal = await baseTradeToken.balanceOf(basePairContract);
      const initialBaseReserve = await basePairContract.reserve();
      await addLiquidity({ contract: basePairContract, tradeToken: baseTradeToken }, basePayment);
      expect((await basePairContract.reserve()) - initialBaseReserve).to.equal(basePayment.amount);

      // Add liquidity to the created pair
      const initialPairReserve = await pairContract.reserve();
      const initialPairTradetokenBal = await pairTradeToken.balanceOf(pairContract);
      await addLiquidity({ contract: pairContract, tradeToken: pairTradeToken }, pairPayment);
      expect((await pairContract.reserve()) - initialPairReserve).to.equal(pairPayment.amount);

      // Check that the liquidity was correctly added to the contract's balance
      expect(await baseTradeToken.balanceOf(basePairContract)).to.equal(basePayment.amount + initialAdexBal);
      expect(await pairTradeToken.balanceOf(pairContract)).to.equal(pairPayment.amount + initialPairTradetokenBal);

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

      const payment = { amount: ethers.parseEther("1"), nonce: 0, token: notPair };

      await expect(router.connect(user).addLiquidity(payment)).to.be.revertedWith("Router: Invalid pair address");
    });

    it("should revert if liquidity amount is zero", async function () {
      const { basePairContract, baseTradeToken, addLiquidity } = await loadFixture(deployRouterFixture);

      const basePayment = { amount: ethers.parseEther("0"), nonce: 0, token: baseTradeToken };

      await expect(
        addLiquidity({ contract: basePairContract, tradeToken: baseTradeToken }, basePayment),
      ).to.be.revertedWith("Router: Invalid liquidity payment");
    });

    it("should generate rewards after adding liquidity", async function () {
      const {
        basePairContract,
        baseTradeToken,
        user,
        addLiquidity,
        createPair,
        owner,
        router,
        sellToken,
        getLpNonces,
        eduPair,
      } = await loadFixture(deployRouterFixture);

      const { pairContract: firstPairContract, pairTradeToken: firstPairTradeToken } = await createPair();

      const basePaymentAmount = ethers.parseEther("10");
      const pairPaymentAmount = ethers.parseEther("223");
      const eduPaymentAmount = ethers.parseEther("0.001");

      // Mint tokens for liquidity
      // await baseTradeToken.connect(owner).transfer(user, basePaymentAmount);
      // await firstPairTradeToken.mint(user, pairPaymentAmount);

      const basePayment = { amount: basePaymentAmount, nonce: 0, token: baseTradeToken };
      const pairPayment = { amount: pairPaymentAmount, nonce: 0, token: firstPairTradeToken };
      const eduPayment = { amount: 0, nonce: 0, token: ZeroAddress };

      await addLiquidity({ contract: basePairContract, tradeToken: baseTradeToken }, basePayment);
      await addLiquidity({ contract: firstPairContract, tradeToken: firstPairTradeToken }, pairPayment);
      await addLiquidity({ contract: eduPair }, eduPayment, { value: eduPaymentAmount });

      expect(await router.getClaimableRewards(user)).to.be.equal(0);

      const executeTrades = async () => {
        await sellToken({
          buyContract: basePairContract,
          sellContract: firstPairContract,
          sellAmt: parseEther("0.00015"),
          mint: true,
        });
        await sellToken({
          buyContract: firstPairContract,
          sellContract: basePairContract,
          sellAmt: parseEther("0.00015"),
          mint: true,
        });
        await router.swap(eduPayment, basePairContract, 10_00, { value: parseEther("0.0001") });
        await firstPairTradeToken.mint(owner, pairPayment.amount);
        await firstPairTradeToken.approve(firstPairContract, pairPayment.amount);
        await router.swap(pairPayment, eduPair, 10_00);
      };

      await executeTrades();

      await time.increase(10);
      expect(await router.getClaimableRewards(user)).to.be.greaterThan(0);
      // await router.connect(user).claimRewards(await getLpNonces(user));

      const { pairContract: secondPairContract, pairTradeToken: secondPairTradeToken } = await createPair();
      const amount = parseEther("89.4");
      await addLiquidity(
        { contract: secondPairContract, tradeToken: secondPairTradeToken },
        { amount, nonce: 0, token: secondPairTradeToken },
      );

      await time.increase(100_000);
      const gainAfterSmallTime = await router.getClaimableRewards(user);
      expect(gainAfterSmallTime).to.be.greaterThan(0);
      // await router.connect(user).claimRewards(await getLpNonces(user));
      await executeTrades();

      // Add more liquidity to some allready added pools after caliming
      basePayment.amount = basePayment.amount / 3n;
      await addLiquidity({ contract: basePairContract, tradeToken: baseTradeToken }, basePayment);
      await addLiquidity({ contract: eduPair }, eduPayment, { value: eduPaymentAmount * 3n });
      await executeTrades();

      await time.increase(1_000_000);
      await executeTrades();
      expect((await router.getClaimableRewards(user)) - gainAfterSmallTime).to.be.greaterThan(0);
      // await router.connect(user).claimRewards(await getLpNonces(user));
    });
  });

  describe("swap", function () {
    it.skip("generates rewards and tax persecond", async () => {
      const { basePairContract, baseTradeToken, owner, eduPair, router } = await loadFixture(deployRouterFixture);

      while ((await router.viewCurrentEpoch()) <= 3) {
        for (let times = 1; times <= 3; times++) {
          const sellAmt = parseEther("0.0002");

          await router.swap({ amount: 0, nonce: 0, token: ZeroAddress }, basePairContract, 1000, { value: sellAmt });

          await baseTradeToken.connect(owner).approve(basePairContract, sellAmt);
          await router.connect(owner).swap({ amount: sellAmt, nonce: 0, token: baseTradeToken }, eduPair, 1000);
        }
        // await time.increase(1);
      }
    });
  });

  describe("removeLiquidity", function () {
    it("returns liquidity added", async () => {
      const {
        user,
        addLiquidity,
        router,
        lpTokenContract,
        eduPair,
        basePairContract,
        createPair,
        baseTradeToken,
        owner,
        sellToken,
      } = await loadFixture(deployRouterFixture);

      const { pairContract, pairTradeToken } = await createPair({ initLiq: parseEther("20000000000000") });
      const payment = { amount: (await pairContract.reserve()) * 5n, nonce: 0, token: pairTradeToken };

      await addLiquidity({ contract: pairContract, signer: user, tradeToken: pairTradeToken }, payment);
      const [lpOne] = await lpTokenContract.lpBalanceOf(user);
      expect(await pairTradeToken.balanceOf(user)).to.eq(0);
      await router.connect(user).removeLiquidity(lpOne.nonce, lpOne.amount);
      expect(await pairTradeToken.balanceOf(user)).to.eq(payment.amount);

      // Again, but with swaps

      await addLiquidity({ contract: pairContract, signer: user, tradeToken: pairTradeToken, mint: false }, payment);
      //  Buy pair
      let value = await router.estimateOutAmount(pairContract, eduPair, (await pairContract.reserve()) / 4n, 100);
      await router.swap({ amount: 0n, nonce: 0, token: ZeroAddress }, pairContract, 10000, {
        value,
      });
      // Sell Pair
      await sellToken({
        someUser: owner,
        buyContract: eduPair,
        sellAmt: parseEther("23.44"),
        sellContract: pairContract,
        mint: true,
        slippage: 1000,
        checkBalances: false,
      });

      const [lp2] = await lpTokenContract.lpBalanceOf(user);
      await router.connect(user).removeLiquidity(lp2.nonce, lp2.amount);
      const userPairTokenBalance = await pairTradeToken.balanceOf(user);
      expect(userPairTokenBalance).to.lt(payment.amount);

      const userRewardsBalance = await baseTradeToken.balanceOf(user);
      expect(userRewardsBalance).to.gt(0);
      console.log({ userRewardsBalance, userPairTokenBalance });
      // User should gain some pairTradeToken used to supply liquidity
      await baseTradeToken.connect(user).approve(basePairContract, userRewardsBalance);
      // while ((await baseTradeToken.balanceOf(user)) > 0n) {
      await router
        .connect(user)
        .swap({ amount: userRewardsBalance, nonce: 0, token: baseTradeToken }, pairContract, 10000);
      // }
      expect(await pairTradeToken.balanceOf(user)).to.gte(payment.amount, "Trying to figure out how to make this pass");
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
        { amount: parseEther("8274.4294279"), nonce: 0, token: baseTradeToken },
      );

      const userLiq = { amount: parseEther("7487464.385"), nonce: 0, token: buyToken };
      await buyToken.mint(user, userLiq.amount);
      await addLiquidity({ tradeToken: userLiq.token, contract: buyContract }, userLiq);

      userLiq.token = sellToken;
      await sellToken.mint(user, userLiq.amount);
      await addLiquidity({ tradeToken: userLiq.token, contract: sellContract }, userLiq);

      expect((await router.pairsData(basePairContract)).buyVolume).to.equal(0);

      const referrerInPayment = { nonce: 0, token: buyToken, amount: parseEther("0.0024846") };
      await referrerInPayment.token.connect(owner).mint(referrer, referrerInPayment.amount);
      await referrerInPayment.token.connect(referrer).approve(buyContract, referrerInPayment.amount);
      await router.connect(referrer).registerAndSwap(0, referrerInPayment, sellContract, 1_00);

      expect(await buyToken.balanceOf(referrer)).to.equal(0);

      const referredInPayment = { nonce: 0, token: sellToken, amount: parseEther("65.767") };
      await referredInPayment.token.connect(owner).mint(referred, referredInPayment.amount);
      await referredInPayment.token.connect(referred).approve(sellContract, referredInPayment.amount);
      await router.connect(referred).registerAndSwap(1, referredInPayment, buyContract, 1_00);

      // referrer receives trade fee
      expect(await buyToken.balanceOf(referrer)).to.be.greaterThan(0);
      expect((await router.pairsData(basePairContract)).buyVolume).to.be.greaterThan(0);
    });
  });

  describe.skip("Router: claimRewards", function () {
    it("should allow users to claim rewards from a pair with valid nonces", async function () {
      const { router, basePairContract, user, pairContract, sellToken, adex, getLpNonces } =
        await loadFixture(claimRewardsFixture);

      // Simulate trading activity to generate rewards
      await sellToken({
        buyContract: pairContract,
        sellAmt: ethers.parseEther("0.05"),
        sellContract: basePairContract,
        mint: true,
      });

      const nonces = await getLpNonces(user);
      // Claim rewards
      await router.connect(user).claimRewards(nonces);

      // Check user's balance after claiming rewards
      const balanceAfterClaim = await adex.balanceOf(user);
      expect(balanceAfterClaim).to.be.gt(0);
    });

    it("should not revert if there are no rewards to claim (this is to utilise gas that should have been wasted to actual update state)", async function () {
      const { router, user, getLpNonces, adex } = await loadFixture(claimRewardsFixture);
      const nonces = await getLpNonces(user);
      const startBal = await adex.balanceOf(user);
      // Fail silently
      await expect(router.connect(user).claimRewards(nonces)).to.not.be.reverted;
      expect(await adex.balanceOf(user)).to.equal(startBal, "ADEX (the reward token) Balance should not change");
    });

    it("should correctly update LP attributes and pair data after claiming", async function () {
      const { router, basePairContract, createPair, user, addLiquidity, sellToken, lpTokenContract, getLpNonces } =
        await loadFixture(claimRewardsFixture);

      const { pairContract, pairTradeToken } = await createPair();

      // Add liquidity and generate rewards
      await addLiquidity(
        { contract: pairContract, tradeToken: pairTradeToken },
        { token: pairTradeToken, amount: ethers.parseEther("0.1"), nonce: 0 },
      );
      await sellToken({
        buyContract: pairContract,
        sellAmt: ethers.parseEther("0.05"),
        sellContract: basePairContract,
        mint: true,
      });

      let nonces = await getLpNonces(user);

      // Get the initial state before claiming rewards
      const initialLpAttributes = await lpTokenContract.getBalanceAt(user, nonces[0]);
      const initialPairData = await router.pairsData(pairContract);

      // Claim rewards
      await router.connect(user).claimRewards(nonces);
      // Nonces update after claim
      nonces = await getLpNonces(user);

      // Check that LP attributes and pair data have been updated correctly
      const updatedLpAttributes = await lpTokenContract.getBalanceAt(user, nonces[0]);
      const updatedPairData = await router.pairsData(pairContract);

      expect(updatedLpAttributes.attributes).to.not.equal(initialLpAttributes.attributes);
      expect(updatedPairData).to.not.equal(initialPairData);
    });

    it("should transfer the correct amount of rewards to the user", async function () {
      const { router, basePairContract, createPair, user, addLiquidity, adex, sellToken, getLpNonces } =
        await loadFixture(claimRewardsFixture);

      const { pairContract, pairTradeToken } = await createPair();

      // Add liquidity and generate rewards
      await addLiquidity(
        { contract: pairContract, tradeToken: pairTradeToken },
        { nonce: 0, token: pairTradeToken, amount: ethers.parseEther("0.1") },
      );
      await sellToken({
        buyContract: pairContract,
        sellAmt: ethers.parseEther("0.05"),
        sellContract: basePairContract,
        mint: true,
      });

      // Claim rewards and check transfer
      const balanceBeforeClaim = await adex.balanceOf(user);

      const nonces = await getLpNonces(user);
      await router.connect(user).claimRewards(nonces);

      const balanceAfterClaim = await adex.balanceOf(user);
      expect(balanceAfterClaim).to.be.greaterThan(balanceBeforeClaim);
    });
  });

  describe("Liquidity Provision and Swapping Scenario", function () {
    it("should swap pairs until depletion, then withdraw liquidity and check if original investment increased", async function () {
      const {
        basePairContract,
        adex: baseTradeToken,
        addLiquidity,
        createPair,
        router,
        lpTokenContract,
        sellToken,
        otherUsers: [investor1, investor2, trader],
      } = await loadFixture(claimRewardsFixture);

      // Create two pairs
      const { pairContract: pair1Contract, pairTradeToken: pair1Token } = await createPair();
      const { pairContract: pair2Contract, pairTradeToken: pair2Token } = await createPair();

      // Investors add liquidity to the pairs
      const investor1PairAmount = parseEther("0.0534");
      const investor2PairAmount = parseEther("0.0453");

      await pair1Token.mint(investor1, investor1PairAmount);
      await addLiquidity(
        { contract: pair1Contract, tradeToken: pair1Token, signer: investor1 },
        { amount: investor1PairAmount, nonce: 0, token: pair1Token },
      );

      await pair2Token.mint(investor2, investor2PairAmount);
      await addLiquidity(
        { contract: pair2Contract, tradeToken: pair2Token, signer: investor2 },
        { amount: investor2PairAmount, token: pair2Token, nonce: 0 },
      );

      // Save initial balances for comparison later
      const initialInvestor1Balance = await pair1Token.balanceOf(investor1);
      const initialInvestor2Balance = await pair2Token.balanceOf(investor2);

      // Trader swaps between pairs until depletion
      let swapAmount = (investor1PairAmount * 9n) / 10n;
      await pair1Token.mint(trader, swapAmount);

      let count = 0;
      while (count < 5) {
        count++;
        await sellToken({
          buyContract: pair2Contract,
          sellContract: pair1Contract,
          sellAmt: swapAmount,
          someUser: trader,
          mint: false,
          slippage: 100_00,
        });

        swapAmount = await pair2Token.balanceOf(trader);
        // Mint more pair2Tokens
        const prevBal = swapAmount;
        swapAmount *= 1005n;
        swapAmount /= 1000n;
        await pair2Token.mint(trader, swapAmount - prevBal);

        await sellToken({
          buyContract: pair1Contract,
          sellContract: pair2Contract,
          sellAmt: swapAmount,
          someUser: trader,
          mint: false,
          slippage: 100_00,
        });

        swapAmount = await pair1Token.balanceOf(trader);

        await time.increase(1000); // Increase time after each swap
      }

      // Investors withdraw their liquidity
      const [investor1LpTokens] = await lpTokenContract.lpBalanceOf(investor1);
      const [investor2LpTokens] = await lpTokenContract.lpBalanceOf(investor2);

      await router.connect(investor1).removeLiquidity(investor1LpTokens.nonce, investor1LpTokens.amount);
      await router.connect(investor2).removeLiquidity(investor2LpTokens.nonce, investor2LpTokens.amount);

      // Convert all base tokens to the initial liquidity token provision
      await sellToken({
        buyContract: pair1Contract,
        sellContract: basePairContract,
        sellAmt: await baseTradeToken.balanceOf(investor1),
        someUser: investor1,
        mint: false,
        slippage: 100_00,
      });

      await sellToken({
        buyContract: pair2Contract,
        sellContract: basePairContract,
        sellAmt: await baseTradeToken.balanceOf(investor2),
        someUser: investor2,
        mint: false,
        slippage: 100_00,
      });

      // Check if the original investment tokens increased
      const finalInvestor1Balance = await pair1Token.balanceOf(investor1);
      const finalInvestor2Balance = await pair2Token.balanceOf(investor2);

      expect(finalInvestor1Balance).to.be.gt(initialInvestor1Balance);
      expect(finalInvestor2Balance).to.be.gt(initialInvestor2Balance);
    });
  });

  describe("EDUPair", function () {
    it("should list EDU pair as native token", async () => {
      const { router, user, basePairContract, lpTokenContract, baseTradeToken, sellToken, eduPair, wEDUaddress, WEDU } =
        await loadFixture(deployRouterFixture);

      // Check adding liq in EDU
      await expect(
        await router
          .connect(user)
          .addLiquidity({ token: WEDU, amount: 0, nonce: 0 }, { value: parseEther("264.54646") }),
      ).to.not.reverted;

      // Sell Edu
      const userEduBalBeforeSell = await ethers.provider.getBalance(user);
      const eduPairEduBalBeforeSell = await WEDU.balanceOf(eduPair);

      await router
        .connect(user)
        .registerAndSwap(0, { token: ZeroAddress, amount: 0, nonce: 0 }, basePairContract, 5_00, {
          value: parseEther("0.00003"),
        });
      expect(await ethers.provider.getBalance(user)).to.lessThan(userEduBalBeforeSell);

      await router
        .connect(user)
        .swap({ token: ZeroAddress, amount: 0, nonce: 0 }, basePairContract, 5_00, { value: parseEther("0.00003") });
      expect(await ethers.provider.getBalance(user)).to.lessThan(userEduBalBeforeSell);
      expect(await WEDU.balanceOf(eduPair)).to.be.gt(eduPairEduBalBeforeSell);

      // Buy Edu
      const userEduBalBeforeBuy = await ethers.provider.getBalance(user);
      const eduPairEduBalBeforeBuy = await WEDU.balanceOf(eduPair);
      await sellToken({
        buyContract: eduPair,
        sellAmt: parseEther("23.3645"),
        sellContract: basePairContract,
        mint: true,
        someUser: user,
        checkBalances: false,
      });
      expect(await WEDU.balanceOf(eduPair)).to.be.lt(eduPairEduBalBeforeBuy);
      expect(await ethers.provider.getBalance(user)).to.gt(userEduBalBeforeBuy);

      await time.increase(274284278427);

      // Check liq removal
      const balanceBeforeRemoveLiq = await ethers.provider.getBalance(user);
      const adexBalBeforeRemoval = await baseTradeToken.balanceOf(user);

      const lpBalance = (await lpTokenContract.lpBalanceOf(user)).find(
        bal => bal.attributes.tradeToken == wEDUaddress,
      )!;
      await router.connect(user).removeLiquidity(lpBalance.nonce, lpBalance.amount);

      expect(await ethers.provider.getBalance(user)).to.gt(balanceBeforeRemoveLiq);
      expect(await baseTradeToken.balanceOf(user)).to.gt(adexBalBeforeRemoval, "Must receive rewards");
    });
  });
});

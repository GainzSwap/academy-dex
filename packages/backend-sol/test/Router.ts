import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture, time } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { parseEther } from "ethers";
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
});

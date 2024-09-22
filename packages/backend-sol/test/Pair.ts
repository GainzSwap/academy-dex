import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { BigNumberish, parseEther } from "ethers";
import { Pair } from "../typechain-types/contracts/pair/Pair";
import { deployRouterFixture } from "./fixtures";

describe("Pair", function () {
  async function deployPairFixture() {
    const { createPair, addLiquidity, baseTradeToken, basePairContract, owner, user, ...fixtures } =
      await deployRouterFixture();

    await baseTradeToken.connect(owner).transfer(user, ethers.parseEther("0.1"));

    const { pairContract, pairTradeToken } = await createPair();

    return {
      ...fixtures,
      basePairContract,
      pairContract,
      pairTradeToken,
      baseTradeToken,
      user,
      owner,
      addLiquidity,
      createPair,
    };
  }

  it("testPairSetup", async () => {
    const { basePairContract } = await loadFixture(deployPairFixture);

    expect(await basePairContract.lpSupply()).to.gt("0");
  });

  describe("sell", function () {
    it("can sell token", async () => {
      const {
        sellToken,
        otherUsers: [, , someUser],
        pairContract,
        pairTradeToken,
        basePairContract,
        baseTradeToken,
      } = await loadFixture(deployPairFixture);
      const runAssert = (args: { buyContract: Pair; sellContract: Pair; sellAmt: BigNumberish }) =>
        sellToken({ ...args, someUser, slippage: 50_00 });

      const sellAmt = 7_000_000n;
      await pairTradeToken.mint(someUser, sellAmt);

      await runAssert({ buyContract: basePairContract, sellAmt, sellContract: pairContract });
      const baseTokenAmt = await baseTradeToken.balanceOf(someUser);
      await runAssert({
        buyContract: pairContract,
        sellAmt: baseTokenAmt,
        sellContract: basePairContract,
      });
    });

    it("can sell tokens", async () => {
      const {
        pairContract: firstPairContract,
        basePairContract,
        createPair,
        sellToken,
      } = await loadFixture(deployPairFixture);
      const sellAmt = 7_000_000;

      await sellToken({ buyContract: basePairContract, sellContract: firstPairContract, sellAmt, mint: true });

      // Create new pair
      const { pairContract: secondPairContract, pairTradeToken: secondTradeToken } = await createPair({
        initLiq: parseEther("23445"),
      });

      await sellToken({
        buyContract: firstPairContract,
        sellContract: secondPairContract,
        sellAmt: parseEther("0.003"),
        slippage: 50_00,
        mint: true,
      });
      await sellToken({
        buyContract: secondPairContract,
        sellContract: basePairContract,
        sellAmt,
        slippage: 50_00,
        mint: true,
      });
    });
  });

  describe("Edge Cases for Adding Liquidity", function () {
    it("should revert when adding zero liquidity", async function () {
      const { addLiquidity, basePairContract, baseTradeToken, user } = await loadFixture(deployPairFixture);

      await expect(
        addLiquidity(
          { contract: basePairContract, tradeToken: baseTradeToken, signer: user },
          { amount: 0, token: baseTradeToken, nonce: 0 },
        ),
      ).to.be.revertedWith("Router: Invalid liquidity payment");
    });

    it("should revert when adding liquidity below minimum amount", async function () {
      const { addLiquidity, basePairContract, baseTradeToken, user } = await loadFixture(deployPairFixture);

      await expect(
        addLiquidity(
          { contract: basePairContract, tradeToken: baseTradeToken, signer: user },
          { amount: ethers.parseEther("0.0"), token: baseTradeToken, nonce: 0 },
        ),
      ).to.be.revertedWith("Router: Invalid liquidity payment");
    });
  });

  describe("Edge Cases for Selling Tokens", function () {
    it("should revert when selling zero tokens", async function () {
      const { sellToken, basePairContract, pairContract, user } = await loadFixture(deployPairFixture);

      await expect(
        sellToken({ sellAmt: 0, sellContract: pairContract, buyContract: basePairContract, someUser: user }),
      ).to.be.revertedWith("Pair: Zero out amount");
    });

    it("should revert when selling more tokens than user's balance", async function () {
      const { sellToken, basePairContract, pairContract, user, pairTradeToken } = await loadFixture(deployPairFixture);

      const userBalance = await pairTradeToken.balanceOf(user);
      await expect(
        sellToken({
          sellAmt: userBalance + 1n,
          sellContract: pairContract,
          buyContract: basePairContract,
          someUser: user,
        }),
      ).to.be.revertedWithCustomError(pairTradeToken, "ERC20InsufficientBalance");
    });
  });

  describe("Slippage Handling", function () {
    it("should handle zero slippage correctly", async function () {
      const { sellToken, basePairContract, pairContract, user, pairTradeToken } = await loadFixture(deployPairFixture);

      await pairTradeToken.mint(user, ethers.parseEther("1000"));
      await pairTradeToken.connect(user).approve(pairContract, ethers.parseEther("1000"));
      await expect(
        sellToken({
          sellAmt: ethers.parseEther("1000"),
          sellContract: pairContract,
          buyContract: basePairContract,
          someUser: user,
          slippage: 0,
        }),
      ).to.be.revertedWith("Invalid slippage value");
    });

    it("should handle high slippage correctly", async function () {
      const { sellToken, basePairContract, pairContract, user, pairTradeToken } = await loadFixture(deployPairFixture);

      const sellAmt = ethers.parseEther("0.0000003");

      await pairTradeToken.mint(user, sellAmt);
      await pairTradeToken.connect(user).approve(pairContract, sellAmt);
      await expect(
        sellToken({
          sellAmt: (sellAmt * 2n) / 3n,
          sellContract: pairContract,
          buyContract: basePairContract,
          someUser: user,
          slippage: 100_00,
        }),
      ).to.not.be.reverted;
    });
  });
});

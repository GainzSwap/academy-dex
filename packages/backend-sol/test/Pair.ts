import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { BigNumberish } from "ethers";
import { Pair } from "../typechain-types/contracts/pair/Pair";
import deployRouterFixture from "./deployRouterFixture";

describe("Pair", function () {
  async function deployPairFixture() {
    const { createPair, addLiquidity, baseTradeToken, basePairContract, owner, user, ...fixtures } =
      await deployRouterFixture();

    await baseTradeToken.connect(owner).transfer(user, ethers.parseEther("0.1"));

    const { pairContract, pairTradeToken } = await createPair();

    const addInitialLiq = async ({ baseAmt, pairAmt }: { baseAmt: BigNumberish; pairAmt: BigNumberish }) => {
      const basePayment = { amount: baseAmt, token: baseTradeToken };
      const pairPayment = { amount: pairAmt, token: pairTradeToken };

      await baseTradeToken.connect(owner).transfer(user, baseAmt);
      const initialAdexBal = await baseTradeToken.balanceOf(basePairContract);
      await addLiquidity({ contract: basePairContract, tradeToken: baseTradeToken }, basePayment);
      expect(await basePairContract.reserve()).to.equal(basePayment.amount);

      await pairTradeToken.mint(user, pairAmt);
      await addLiquidity({ contract: pairContract, tradeToken: pairTradeToken }, pairPayment);
      expect(await pairContract.reserve()).to.equal(pairPayment.amount);

      expect(await baseTradeToken.balanceOf(basePairContract)).to.equal(BigInt(basePayment.amount) + initialAdexBal);
      expect(await pairTradeToken.balanceOf(pairContract)).to.equal(pairPayment.amount);
    };

    return {
      ...fixtures,
      basePairContract,
      pairContract,
      pairTradeToken,
      baseTradeToken,
      user,
      owner,
      addLiquidity,
      addInitialLiq,
      createPair,
    };
  }

  it("testPairSetup", async () => {
    const { basePairContract } = await loadFixture(deployPairFixture);

    expect(await basePairContract.lpSupply()).to.equal("0");
  });

  describe("addLiquidity", function () {
    it("adds initial liquity for base and pair contracts", async function () {
      const { addInitialLiq } = await loadFixture(deployPairFixture);

      await addInitialLiq({ baseAmt: 4_000, pairAmt: 50_000 });
    });
  });

  describe("sell", function () {
    it("can sell token", async () => {
      const {
        addInitialLiq,
        sellToken,
        otherUsers: [, , someUser],
        pairContract,
        pairTradeToken,
        basePairContract,
        baseTradeToken,
      } = await loadFixture(deployPairFixture);
      const runAssert = (args: { buyContract: Pair; sellContract: Pair; sellAmt: BigNumberish }) =>
        sellToken({ ...args, someUser });
      await addInitialLiq({ baseAmt: 15_000_000, pairAmt: 15_000_000 });

      const sellAmt = 7000n;
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
        addInitialLiq,
        addLiquidity,
        pairContract: firstPairContract,
        basePairContract,
        createPair,
        sellToken,
      } = await loadFixture(deployPairFixture);
      await addInitialLiq({ baseAmt: 15_000_000, pairAmt: 900_000_000 });

      await sellToken({ buyContract: basePairContract, sellContract: firstPairContract, sellAmt: 7000 });

      // Create new pair
      const { pairContract: secondPairContract, pairTradeToken: secondTradeToken } = await createPair();
      await addLiquidity(
        { tradeToken: secondTradeToken, contract: secondPairContract },
        { amount: 80_000_000, token: secondTradeToken },
      );

      await sellToken({ buyContract: firstPairContract, sellContract: secondPairContract, sellAmt: 7000 });
      await sellToken({ buyContract: secondPairContract, sellContract: basePairContract, sellAmt: 7000 });
    });
  });

  describe("Edge Cases for Adding Liquidity", function () {
    it("should revert when adding zero liquidity", async function () {
      const { addLiquidity, basePairContract, baseTradeToken, user } = await loadFixture(deployPairFixture);

      await expect(
        addLiquidity(
          { contract: basePairContract, tradeToken: baseTradeToken, signer: user },
          { amount: 0, token: baseTradeToken },
        ),
      ).to.be.revertedWith("Pair: Bad received payment");
    });

    it("should revert when adding liquidity below minimum amount", async function () {
      const { addLiquidity, basePairContract, baseTradeToken, user } = await loadFixture(deployPairFixture);

      await expect(
        addLiquidity(
          { contract: basePairContract, tradeToken: baseTradeToken, signer: user },
          { amount: ethers.parseEther("0.0"), token: baseTradeToken },
        ),
      ).to.be.revertedWith("Pair: Bad received payment");
    });

    it("should revert when user has insufficient token balance", async function () {
      const {
        addLiquidity,
        basePairContract,
        baseTradeToken,
        otherUsers: [anotherUser],
      } = await loadFixture(deployPairFixture);

      await expect(
        addLiquidity(
          { contract: basePairContract, tradeToken: baseTradeToken, signer: anotherUser },
          { amount: ethers.parseEther("1"), token: baseTradeToken },
        ),
      ).to.be.revertedWith("ERC20: transfer amount exceeds balance");
    });
  });

  describe("Edge Cases for Selling Tokens", function () {
    it("should revert when selling zero tokens", async function () {
      const { sellToken, basePairContract, pairContract, user, addInitialLiq } = await loadFixture(deployPairFixture);
      await addInitialLiq({ baseAmt: ethers.parseEther("15.00554"), pairAmt: ethers.parseEther("9.943") });

      await expect(
        sellToken({ sellAmt: 0, sellContract: pairContract, buyContract: basePairContract, someUser: user }),
      ).to.be.revertedWith("Pair: Zero out amount");
    });

    it("should revert when selling more tokens than user's balance", async function () {
      const { sellToken, basePairContract, pairContract, user, pairTradeToken, addInitialLiq } =
        await loadFixture(deployPairFixture);
      await addInitialLiq({ baseAmt: ethers.parseEther("15.00554"), pairAmt: ethers.parseEther("9.943") });

      const userBalance = await pairTradeToken.balanceOf(user);
      await expect(
        sellToken({
          sellAmt: userBalance + 1n,
          sellContract: pairContract,
          buyContract: basePairContract,
          someUser: user,
        }),
      ).to.be.revertedWith("ERC20: transfer amount exceeds balance");
    });
  });

  describe("Slippage Handling", function () {
    it("should handle zero slippage correctly", async function () {
      const { sellToken, basePairContract, pairContract, user, pairTradeToken, addInitialLiq } =
        await loadFixture(deployPairFixture);
      await addInitialLiq({ baseAmt: ethers.parseEther("15.00554"), pairAmt: ethers.parseEther("9.943") });

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
      const { sellToken, basePairContract, pairContract, user, pairTradeToken, addInitialLiq } =
        await loadFixture(deployPairFixture);

      const sellAmt = ethers.parseEther("1000");

      await addInitialLiq({ baseAmt: ethers.parseEther("15.00554"), pairAmt: sellAmt });

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

  describe("Fee Calculation and Burning", function () {
    // FIXME sales state is not updating here, but updates in contract
    it.skip("should correctly calculate and burn fees during sale", async function () {
      const {
        sellToken,
        basePairContract: buyContract,
        pairContract: sellContract,
        user,
        addInitialLiq,
      } = await loadFixture(deployPairFixture);

      await addInitialLiq({ baseAmt: ethers.parseEther("1500554"), pairAmt: ethers.parseEther("1900.943") });

      const initialSales = await buyContract.sales();

      await sellToken({
        sellAmt: ethers.parseEther("1000"),
        sellContract,
        buyContract,
        someUser: user,
        slippage: 100_00,
      });

      // Increase in buyContract sales indicates burn fee collection, the other fee
      // is added to deposits
      const finalSales = await buyContract.sales();
      expect(finalSales).to.be.greaterThan(initialSales);
    });
  });
});

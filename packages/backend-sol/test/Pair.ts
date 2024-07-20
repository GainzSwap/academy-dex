import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture, time } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { ZeroAddress } from "ethers";

const randomAddress = () => ethers.Wallet.createRandom().address;

describe("Pair", function () {
  async function deployPairFixture() {
    const firstToken = await ethers.deployContract("TestingERC20", ["FirstToken", "FTK"]);
    const secondToken = await ethers.deployContract("TestingERC20", ["SecondToken", "STK"]);

    const routerAddress = randomAddress();
    const [routerOwner] = await ethers.getUnnamedSigners();
    const initialLiquidityAdder = ZeroAddress;

    const pairContract = await ethers.deployContract("Pair", [
      firstToken,
      secondToken,
      routerAddress,
      routerOwner.address,
      300,
      50,
      initialLiquidityAdder,
    ]);

    return { pairContract, firstToken, secondToken, routerOwner };
  }

  it("testPairSetup", async () => {
    const { pairContract } = await loadFixture(deployPairFixture);

    expect(await pairContract.state()).to.equal("0");
  });

  describe("addLiquidity", function () {
    it("can add liquity", async function () {
      const { pairContract, firstToken, secondToken, routerOwner } = await loadFixture(deployPairFixture);
      const [owner] = await ethers.getSigners();

      await pairContract.connect(routerOwner).resume();

      const firstTokenAmtMin = 1_000_000;
      const secondTokenAmtMin = 1_000_000;

      const [expectedLpAmt, expectedFirstTokenAmt, expectedSecondTokenAmt] = [1_000_000, 1_001_000, 1_001_000];

      const firstTokenSent = { amount: 1_001_000, tokenAddress: firstToken };
      const secondTokenSent = { amount: 1_001_000, tokenAddress: secondToken };

      const pairContractAddr = await pairContract.getAddress();

      await firstToken.mint(owner.address, firstTokenSent.amount * 2);
      await secondToken.mint(owner.address, secondTokenSent.amount * 2);

      await firstToken.approve(pairContractAddr, firstTokenSent.amount * 2);
      await secondToken.approve(pairContractAddr, secondTokenSent.amount * 2);

      await expect(pairContract.addLiquidity(firstTokenAmtMin, secondTokenAmtMin, firstTokenSent, secondTokenSent))
        .to.emit(pairContract, "AddLiquidity")
        .withArgs(firstToken, secondToken, owner.address, [
          owner.address,
          firstTokenSent.tokenAddress,
          firstTokenSent.amount,
          secondTokenSent.tokenAddress,
          secondTokenSent.amount,
          pairContractAddr,
          expectedLpAmt,
          1001000,
          expectedFirstTokenAmt,
          expectedSecondTokenAmt,
          (await time.latestBlock()) + 1,
          (await time.latest()) + 1,
        ]);

      expect(await pairContract.balanceOf(owner)).to.equal(expectedLpAmt);
      expect(await firstToken.balanceOf(pairContract)).to.equal(firstTokenSent.amount);
      expect(await secondToken.balanceOf(pairContract)).to.equal(secondTokenSent.amount);

      // Add again to increase code coverage
      await pairContract.addLiquidity(firstTokenAmtMin, secondTokenAmtMin, firstTokenSent, secondTokenSent);
    });
  });
});

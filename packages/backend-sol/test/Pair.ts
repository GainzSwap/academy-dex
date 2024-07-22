import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture, time } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { ZeroAddress } from "ethers";
import { ERC20TokenPaymentStruct } from "../typechain-types/contracts/pair/Pair";

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

    await pairContract.connect(routerOwner).resume();

    const [owner] = await ethers.getSigners();
    const lpAddr = await pairContract.lpAddress();

    return {
      pairContract,
      firstToken,
      secondToken,
      routerOwner,

      lpAddr,
      lpToken: await ethers.getContractAt("LpToken", lpAddr),

      owner,
      addLiquidity: async (...args: Parameters<typeof pairContract.addLiquidity>) => {
        const firstTokenSent = args[2] as ERC20TokenPaymentStruct;
        const secondTokenSent = args[3] as ERC20TokenPaymentStruct;

        await firstToken.mint(owner.address, firstTokenSent.amount);
        await secondToken.mint(owner.address, secondTokenSent.amount);

        await firstToken.approve(pairContract, firstTokenSent.amount);
        await secondToken.approve(pairContract, secondTokenSent.amount);

        return pairContract.addLiquidity(...args);
      },
    };
  }

  it("testPairSetup", async () => {
    const { pairContract } = await loadFixture(deployPairFixture);

    expect(await pairContract.state()).to.equal("1");
  });

  describe("addLiquidity", function () {
    it("can add liquity", async function () {
      const { pairContract, firstToken, secondToken, owner, lpAddr, addLiquidity } =
        await loadFixture(deployPairFixture);

      const firstTokenAmtMin = 1_000_000;
      const secondTokenAmtMin = 1_000_000;

      const [expectedLpAmt, expectedFirstTokenAmt, expectedSecondTokenAmt] = [1_000_000, 1_001_000, 1_001_000];

      const firstTokenSent = { amount: 1_001_000, token: firstToken };
      const secondTokenSent = { amount: 1_001_000, token: secondToken };

      await expect(addLiquidity(firstTokenAmtMin, secondTokenAmtMin, firstTokenSent, secondTokenSent))
        .to.emit(pairContract, "AddLiquidity")
        .withArgs(firstToken, secondToken, owner.address, [
          owner.address,
          firstTokenSent.token,
          firstTokenSent.amount,
          secondTokenSent.token,
          secondTokenSent.amount,
          lpAddr,
          expectedLpAmt,
          1001000,
          expectedFirstTokenAmt,
          expectedSecondTokenAmt,
          (await time.latestBlock()) + 5,
          (await time.latest()) + 5,
        ]);

      expect(await pairContract.lpTokenBalanceOf(owner)).to.equal(expectedLpAmt);
      expect(await firstToken.balanceOf(pairContract)).to.equal(firstTokenSent.amount);
      expect(await secondToken.balanceOf(pairContract)).to.equal(secondTokenSent.amount);

      // Add again to increase code coverage
      await addLiquidity(firstTokenAmtMin, secondTokenAmtMin, firstTokenSent, secondTokenSent);
    });
  });

  describe("removeLiquidity", function () {
    it("can remove liquidity", async function () {
      const { pairContract, firstToken, secondToken, lpAddr, addLiquidity, lpToken, owner } =
        await loadFixture(deployPairFixture);
      const firstTokenAmtMin = 1_000_000;
      const secondTokenAmtMin = 1_000_000;

      const firstTokenSent = { amount: 1_001_000, token: firstToken };
      const secondTokenSent = { amount: 1_001_000, token: secondToken };

      await addLiquidity(firstTokenAmtMin, secondTokenAmtMin, firstTokenSent, secondTokenSent);

      const expectedLpAmt = 1_000_000;
      expect(await lpToken.balanceOf(owner)).to.equal(expectedLpAmt);
      const lpPayment = { token: lpAddr, amount: expectedLpAmt };

      await lpToken.approve(pairContract, lpPayment.amount);
      await expect(pairContract.removeLiquidity(firstTokenAmtMin, secondTokenAmtMin, lpPayment)).to.emit(
        pairContract,
        "RemoveLiquidity",
      );
      expect(await lpToken.balanceOf(owner)).to.equal(0);
    });
  });
});

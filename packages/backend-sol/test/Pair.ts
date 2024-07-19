import { expect } from "chai";
import { ethers } from "hardhat";
import { Pair } from "../typechain-types";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("Pair", function () {
  async function deployPairFixture() {
    const firstToken = ethers.Wallet.createRandom().address;
    const secondToken = ethers.Wallet.createRandom().address;

    const routerAddress = ethers.Wallet.createRandom().address;
    const routerOwnerAddress = ethers.Wallet.createRandom().address;
    const initialLiquidityAdder = ethers.Wallet.createRandom().address;

    const pairContract = await ethers.deployContract("Pair", [
      firstToken,
      secondToken,
      routerAddress,
      routerOwnerAddress,
      300,
      50,
      initialLiquidityAdder,
    ]);

    return { pairContract };
  }

  it("load", async () => {
    const { pairContract } = await loadFixture(deployPairFixture);

    expect(await pairContract.state()).to.equal("0");
  });
});

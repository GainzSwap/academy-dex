import { ethers } from "hardhat";

describe("slot", function () {
  const key = "adex.pair.main";
  it.skip("gotten", async function () {
    const storageSlot = await ethers.deployContract("ComputeStorageSlot");
    console.log(await storageSlot.slot(Buffer.from(key)));
  });
});

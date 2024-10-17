import "@nomicfoundation/hardhat-toolbox";
import { task } from "hardhat/config";
import { Router } from "../typechain-types";

task("verifyAllContracts", "").setAction(async (_, hre) => {
  const { deployer } = await hre.getNamedAccounts();
  const router = await hre.ethers.getContract<Router>("Router", deployer);

  const goveAddr = await router.governance();
  const governance = await hre.ethers.getContractAt("Governance", goveAddr);
  const launchPairAddress = await governance.launchPair();

  const verifyAddresses = [
    await router.getAddress(),
    ...(await router.getAllPairs()),
    await router.governance(),
    goveAddr,
    launchPairAddress,
  ];

  for (const address of verifyAddresses) {
    try {
      await hre.run("verify", { address, force: true });
    } catch (error) {
      console.error(error);
    }
  }
});

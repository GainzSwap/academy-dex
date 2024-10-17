import "@nomicfoundation/hardhat-toolbox";
import { task } from "hardhat/config";
import { Router } from "../typechain-types";

task("upgradeLPToken", "").setAction(async (_, hre) => {
  await hre.run("compile");

  const { ethers } = hre;
  const { deployer } = await hre.getNamedAccounts();
  const router = await ethers.getContract<Router>("Router", deployer);
  const lpTokenAddr = await router.lpToken();

  const lpTokenUpgradeFactory = async () => ethers.getContractFactory("LpToken");

  const lpTokenImplementation = await hre.upgrades.forceImport(lpTokenAddr, await lpTokenUpgradeFactory());

  await hre.upgrades.upgradeProxy(lpTokenImplementation, await lpTokenUpgradeFactory(), {
    redeployImplementation: "always",
  });

  await hre.run("verify", { address: lpTokenAddr });
});

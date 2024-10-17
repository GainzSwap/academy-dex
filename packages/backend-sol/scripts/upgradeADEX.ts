import "@nomicfoundation/hardhat-toolbox";
import { task } from "hardhat/config";
import { Router } from "../typechain-types";

task("upgradeADEX", "").setAction(async (_, hre) => {
  await hre.run("compile");

  const { ethers } = hre;
  const { deployer } = await hre.getNamedAccounts();
  const router = await ethers.getContract<Router>("Router", deployer);
  const adexAddress = await (await ethers.getContractAt("BasePair", await router.basePairAddr())).tradeToken();

  const adexUpgradeFactory = async () => ethers.getContractFactory("ADEX");

  const adexImplementation = await hre.upgrades.forceImport(adexAddress, await adexUpgradeFactory());

  await hre.upgrades.upgradeProxy(adexImplementation, await adexUpgradeFactory(), {
    redeployImplementation: "always",
  });

  await hre.run("verify", { address: adexAddress });
});

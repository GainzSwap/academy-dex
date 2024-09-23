import "@nomicfoundation/hardhat-toolbox";
import { task } from "hardhat/config";
import { Router } from "../typechain-types";

task("upgradeLaunchpair", "Upgrades launchpair").setAction(async (_, hre) => {
  const { ethers } = hre;

  const { deployer } = await hre.getNamedAccounts();
  const router = await ethers.getContract<Router>("Router", deployer);
  const goveAddr = await router.governance();
  const launchpairFactory = () => ethers.getContractFactory("LaunchPair");

  const launchPairAddress = await (await ethers.getContractAt("Governance", goveAddr)).launchPair();
  const launchpairProxy = await hre.upgrades.forceImport(launchPairAddress, await launchpairFactory());

  await hre.run("compile");
  await hre.upgrades.upgradeProxy(launchpairProxy, await launchpairFactory());

  const { abi, metadata } = await hre.deployments.getExtendedArtifact("LaunchPair");
  await hre.deployments.save("LaunchPair", { abi, metadata, address: launchPairAddress });
  await hre.deployments.run("generateTsAbis");
});

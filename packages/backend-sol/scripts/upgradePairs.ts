import "@nomicfoundation/hardhat-toolbox";
import { task } from "hardhat/config";
import { Router } from "../typechain-types";

task("upgradePairs", "Upgrades all pairs, remember to edit script with new factories").setAction(async (_, hre) => {
  const { deployer } = await hre.getNamedAccounts();
  const router = await hre.ethers.getContract<Router>("Router", deployer);

  const pairBeaconAddress = await router.getPairBeacon();
  const basePairAddr = await router.basePairAddr();
  const eduPairAddr = await router.eduPairAddr();
  // Get contract factories for the new implementations
  const basePairFactory = () => hre.ethers.getContractFactory("BasePair");
  const eduPairFactory = () => hre.ethers.getContractFactory("EDUPair");
  const pairFactory = () => hre.ethers.getContractFactory("Pair");

  // Force import the BasePair and EDUPair proxies before upgrading
  console.log("Force importing BasePair proxy...");
  const basePairProxy = await hre.upgrades.forceImport(basePairAddr, await basePairFactory());
  console.log("Force importing EDUPair proxy...");
  const eduPairProxy = await hre.upgrades.forceImport(eduPairAddr, await eduPairFactory());
  // Force import the Beacon contract before upgrading
  console.log("Force importing Pair beacon...");
  const pairBeacon = await hre.upgrades.forceImport(pairBeaconAddress, await pairFactory());

  console.log("\nCompiling new Pair\n");
  await hre.run("compile");

  // Upgrade the BasePair and EDUPair proxies after importing
  console.log("Upgrading BasePair proxy...");
  await hre.upgrades.upgradeProxy(basePairProxy, await basePairFactory());
  console.log("BasePair upgraded successfully.");
  console.log("Upgrading EDUPair proxy...");
  await hre.upgrades.upgradeProxy(eduPairProxy, await eduPairFactory());
  console.log("EDUPair upgraded successfully.");
  // Upgrade the Beacon with the new implementation of Pair
  console.log("Upgrading Pair beacon...");
  await hre.upgrades.upgradeBeacon(pairBeacon, await pairFactory());
  console.log("Pair beacon upgraded successfully.");

  console.log("\nSaving Pair artifacts");
  // Optionally save the new ABI and metadata for the upgraded contract
  const { abi, metadata } = await hre.deployments.getExtendedArtifact("Pair");
  await hre.deployments.save("Pair", { abi, metadata, address: basePairAddr });

  // Run any additional tasks, such as generating TypeScript ABIs
  await hre.deployments.run("generateTsAbis");
});

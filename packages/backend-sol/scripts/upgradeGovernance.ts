import "@nomicfoundation/hardhat-toolbox";
import { task } from "hardhat/config";
import { Router } from "../typechain-types";

task("upgradeGovernance", "Upgrades governance").setAction(async (_, hre) => {
  const { ethers } = hre;

  const { deployer } = await hre.getNamedAccounts();
  const router = await ethers.getContract<Router>("Router", deployer);
  const governanceAddress = await router.governance();
  const governanceFactory = async () =>
    ethers.getContractFactory("Governance", {
      libraries: {
        NewGTokens: await (await ethers.deployContract("NewGTokens")).getAddress(),
        GovernanceLib: await (await ethers.deployContract("GovernanceLib")).getAddress(),
        DeployLaunchPair: await (await ethers.deployContract("DeployLaunchPair")).getAddress(),
      },
    });

  const governanceProxy = await hre.upgrades.forceImport(governanceAddress, await governanceFactory());

  await hre.run("compile");
  await hre.upgrades.upgradeProxy(governanceProxy, await governanceFactory(), {
    unsafeAllow: ["external-library-linking"],
  });

  const { abi, metadata } = await hre.deployments.getExtendedArtifact("Governance");
  await hre.deployments.save("Governance", { abi, metadata, address: governanceAddress });
  await hre.deployments.run("generateTsAbis");
});

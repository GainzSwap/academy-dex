import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployRouterContract: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { upgrades } = hre;
  const { ethers } = hre;

  const DeployGovernanceFactory = await hre.ethers.getContractFactory("DeployGovernance", {
    libraries: {
      NewGTokens: await (await ethers.deployContract("NewGTokens")).getAddress(),
      DeployLaunchPair: await (await ethers.deployContract("DeployLaunchPair")).getAddress(),
      GovernanceLib: await (await ethers.deployContract("GovernanceLib")).getAddress(),
    },
  });
  const deployGovernance = await DeployGovernanceFactory.deploy();
  await deployGovernance.waitForDeployment();

  const Router = await ethers.getContractFactory("Router", {
    libraries: {
      DeployLpToken: await (await ethers.deployContract("DeployLpToken")).getAddress(),
      DeployPair: await (await ethers.deployContract("DeployPair")).getAddress(),
      DeployBasePair: await (await ethers.deployContract("DeployBasePair")).getAddress(),
      DeployEduPair: await (await ethers.deployContract("DeployEduPair")).getAddress(),
      DeployGovernance: await deployGovernance.getAddress(),
    },
  });
  const router = await upgrades.deployProxy(Router, [deployer], { unsafeAllow: ["external-library-linking"] });
  await router.waitForDeployment();

  const { abi, metadata } = await hre.deployments.getExtendedArtifact("Router");
  await hre.deployments.save("Router", { abi, metadata, address: await router.getAddress() });
};

export default deployRouterContract;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags RouterContract
deployRouterContract.tags = ["initialDeployment"];

import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployRouterContract: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const DeployGovernanceFactory = await hre.ethers.getContractFactory("DeployGovernance", {
    libraries: {
      NewGTokens: await (await hre.ethers.deployContract("NewGTokens")).getAddress(),
      DeployLaunchPair: await (await hre.ethers.deployContract("DeployLaunchPair")).getAddress(),
    },
  });
  const deployGovernance = await DeployGovernanceFactory.deploy();
  await deployGovernance.waitForDeployment();

  await deploy("Router", {
    from: deployer,
    autoMine: true,
    libraries: {
      DeployPair: await (await hre.ethers.deployContract("DeployPair")).getAddress(),
      DeployBasePair: await (await hre.ethers.deployContract("DeployBasePair")).getAddress(),
      DeployEduPair: await (await hre.ethers.deployContract("DeployEduPair")).getAddress(),
      DeployGovernance: await deployGovernance.getAddress(),
    },
  });
};

export default deployRouterContract;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags RouterContract
deployRouterContract.tags = ["Router"];

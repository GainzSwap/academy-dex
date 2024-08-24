import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployRouterContract: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const PairFactory = await hre.ethers.getContractFactory("PairFactory");
  const pairFactoryInstance = await PairFactory.deploy();
  await pairFactoryInstance.waitForDeployment();

  const DeployGovernanceFactory = await hre.ethers.getContractFactory("DeployGovernance", {
    libraries: {
      NewGTokens: await (await hre.ethers.deployContract("NewGTokens")).getAddress(),
    },
  });
  const deployGovernance = await DeployGovernanceFactory.deploy();
  await deployGovernance.waitForDeployment();

  await deploy("Router", {
    from: deployer,
    autoMine: true,
    libraries: {
      PairFactory: await pairFactoryInstance.getAddress(),
      DeployGovernance: await deployGovernance.getAddress(),
    },
  });
};

export default deployRouterContract;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags RouterContract
deployRouterContract.tags = ["Router"];

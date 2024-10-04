import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Router } from "../typechain-types";
import { ZeroAddress } from "ethers";

const deployPairs: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  // Done to have the abi in front end
  const { deployer } = await hre.getNamedAccounts();
  const { ethers } = hre;

  const Router = await ethers.getContract<Router>("Router", deployer);

  const { save, getExtendedArtifact } = hre.deployments;

  const governanceAdr = await Router.governance();
  const governance = await hre.ethers.getContractAt("Governance", governanceAdr);
  const launchPairAddr = await governance.launchPair();
  const gTokensAddr = await governance.gtokens();

  const artifactsToSave = [
    ["Pair", ZeroAddress],
    ["Governance", governanceAdr],
    ["GTokens", gTokensAddr],
    ["LpToken", await Router.lpToken()],
    ["LaunchPair", launchPairAddr],
    ["WEDU", await Router.getWEDU()],
  ];

  for (const [contract, address] of artifactsToSave) {
    const { abi, metadata } = await getExtendedArtifact(contract);
    await save(contract, { abi, metadata, address });
  }
};

export default deployPairs;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags Pairs
deployPairs.tags = ["initialDeployment", "saveArtifacts"];

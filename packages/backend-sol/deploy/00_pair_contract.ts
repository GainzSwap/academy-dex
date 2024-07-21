import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";
import { ZeroAddress } from "ethers";

const randomAddress = () => ethers.Wallet.createRandom().address;

const deployPairContract: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();

  const TestingERC20 = await hre.ethers.getContractFactory("TestingERC20");

  const firstTokenContract = await (await TestingERC20.deploy("Testing1", "1TST")).waitForDeployment();
  const secondTokenContract = await (await TestingERC20.deploy("Testing2", "2TST")).waitForDeployment();

  const firstToken = await firstTokenContract.getAddress();
  const secondToken = await secondTokenContract.getAddress();

  const routerAddress = randomAddress();
  const routerOwnerAddress = deployer;
  const initialLiquidityAdder = ZeroAddress;

  const Pair = await hre.ethers.getContractFactory("Pair");
  const pairContract = await (
    await Pair.deploy(firstToken, secondToken, routerAddress, routerOwnerAddress, 300, 50, initialLiquidityAdder)
  ).waitForDeployment();

  const firstTokenSent = { amount: 1_001_000, tokenAddress: firstToken };
  const secondTokenSent = { amount: 1_001_000, tokenAddress: secondToken };

  await firstTokenContract.approve(pairContract, firstTokenSent.amount);
  await secondTokenContract.approve(pairContract, secondTokenSent.amount);

  const firstTokenAmtMin = 1_000_000;
  const secondTokenAmtMin = 1_000_000;
  await pairContract.resume();
  await pairContract.addLiquidity(firstTokenAmtMin, secondTokenAmtMin, firstTokenSent, secondTokenSent);
};

export default deployPairContract;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags PairContract
deployPairContract.tags = ["Pair"];

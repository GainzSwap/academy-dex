import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";

const deployRouterContract: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const routerAddress = (await deploy("Router", { from: deployer })).address;
  const Router = await ethers.getContractAt("Router", routerAddress);

  const erc20Token = await ethers.getContractFactory("MintableERC20");

  for (const [name, symbol] of [
    ["BaseToken", "BSTK"],
    ["GainsNetwork", "CPTR"],
    ["SocialFi", "TRND"],
    ["HouseX", "AKU"],
    ["ExistenceToken", "HTH"],
  ]) {
    const tradeToken = await (await erc20Token.deploy(name, symbol)).waitForDeployment();
    const tradeTokenAddr = await tradeToken.getAddress();

    await (await Router.createPair(tradeToken)).wait();

    const value = (Math.random() ** Math.random() * 3_000_000).toString();
    const liq = ethers.parseEther(value);
    await (await tradeToken.mint(deployer, liq)).wait();

    const pairAddress = await Router.tokensPairAddress(tradeTokenAddr);

    console.log({ name, liq, pairAddress });
    await (await tradeToken.approve(pairAddress, liq)).wait();

    await (await Router.addLiquidity({ amount: liq, token: tradeTokenAddr })).wait();
  }
};

export default deployRouterContract;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags RouterContract
deployRouterContract.tags = ["Router"];

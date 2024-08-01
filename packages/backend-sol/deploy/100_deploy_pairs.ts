import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";
import { MintableERC20, Router } from "../typechain-types";
import { parseEther } from "ethers";

const deployPairs: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();

  const Router = await ethers.getContract<Router>("Router", deployer);

  const erc20Token = await ethers.getContractFactory("MintableERC20");

  // Get from chain data to stay in sync with multiple calls
  let pairsCount = +(await Router.pairsCount()).toString();
  let tradeToken: MintableERC20, tradeTokenAddr: string, pairAddress: string;
  const tester1 = "0x8D0739d9D0d49aFCF8d101416cD2759Bf8922013";
  const tester2 = "0x608bB522a3ed264C22f663dEB2585662bFe110BD";
  for (let [name, symbol] of [
    ["", ""],
    ["GainsNetwork", "CPTR"],
    ["SocialFi", "TRND"],
    ["HouseX", "AKU"],
    ["ExistenceToken", "HTH"],
  ]) {
    const value = (Math.random() ** 10 * 30_000_000_000).toString();
    const liq = ethers.parseEther(value);

    if (pairsCount === 0) {
      await Router.createPair(ethers.ZeroAddress);
      await Router.mintInitialSupply(liq);
      pairAddress = await Router.basePairAddr();

      const basePair = await ethers.getContractAt("BasePair", pairAddress);

      tradeTokenAddr = await basePair.tradeToken();
      tradeToken = await ethers.getContractAt("MintableERC20", tradeTokenAddr);

      name = await tradeToken.name();
      symbol = await tradeToken.symbol();
    } else {
      const token = await erc20Token.deploy(name, symbol);
      tradeToken = await token.waitForDeployment();
      tradeTokenAddr = await tradeToken.getAddress();

      await Router.createPair(tradeTokenAddr);
      await tradeToken.mint(deployer, liq);
      pairAddress = await Router.tokensPairAddress(tradeTokenAddr);
    }
    pairsCount++;

    console.log({ name, liq, pairAddress, tradeTokenAddr });
    await tradeToken.approve(pairAddress, liq);

    await Router.addLiquidity({ amount: liq, token: tradeTokenAddr });

    if (pairsCount > 1) {
      // Mint the last token for this address
      await tradeToken.mint(tester1, parseEther(value) / 100_000n);
      await tradeToken.mint(tester2, parseEther(value) / 100_00n);
    }
  }
  // Done to have the abi in front end
  await hre.deployments.deploy("Pair", {
    from: deployer,
    gasLimit: 30_000_000,
    args: [tradeTokenAddr!, pairAddress!],
  });

  if (hre.network.name == "localhost") {
    // Send network tokens
    await Promise.all([
      (await ethers.getSigner(deployer)).sendTransaction({ value: parseEther("99"), to: tester1 }),
      (await ethers.getSigner(deployer)).sendTransaction({ value: parseEther("999"), to: tester2 }),
    ]);
  }
};

export default deployPairs;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags Pairs
deployPairs.tags = ["Pairs"];

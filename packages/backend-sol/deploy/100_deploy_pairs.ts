import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";
import { ADEX, MintableERC20, MintableERC20__factory, Router } from "../typechain-types";
import { parseEther } from "ethers";

const deployPairs: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();

  const Router = await ethers.getContract<Router>("Router", deployer);

  let erc20Token: MintableERC20__factory | undefined;

  // Get from chain data to stay in sync with multiple calls
  let pairsCount = +(await Router.pairsCount()).toString();
  let tradeToken: MintableERC20 | ADEX | undefined, tradeTokenAddr: string, pairAddress: string;

  const testers = process.env.TESTERS?.split(",") ?? [];
  const isLocalHost = hre.network.name == "localhost";
  const txWaitTime = hre.network.name == "neox" ? 5 : 1;

  for (let [name, symbol] of [
    ["", ""], // Base Pair
    ["", ""], // EDU pair
    ["GainsNetwork", "CPTR"],
    ["SocialFi", "TRND"],
    ["HouseX", "AKU"],
    ["ExistenceToken", "HTH"],
  ]) {
    if (!isLocalHost && name.length > 0) {
      // Skip dummy pairs in public networks
      continue;
    }

    const payment = { token: ethers.ZeroAddress, amount: 0n, nonce: 0 };

    if (pairsCount === 0) {
      const createBasePairTx = await Router.createPair(payment);
      await createBasePairTx.wait(txWaitTime);

      pairAddress = await Router.basePairAddr();

      const basePair = await ethers.getContractAt("BasePair", pairAddress);

      tradeTokenAddr = await basePair.tradeToken();
      tradeToken = await ethers.getContractAt("ADEX", tradeTokenAddr);

      name = await tradeToken.name();
      symbol = await tradeToken.symbol();
    } else {
      if (!name) {
        // Deploy EDU
        const createNativePairTx = await Router.createPair(payment, {
          value: (await hre.ethers.provider.getBalance(deployer)) / 100_000n,
        });
        await createNativePairTx.wait(txWaitTime);

        tradeTokenAddr = await Router.getWEDU();

        const wEduToken = await ethers.getContractAt("WEDU", tradeTokenAddr);

        name = await wEduToken.name();
        symbol = await wEduToken.symbol();
      } else {
        if (!erc20Token) {
          erc20Token = await ethers.getContractFactory("MintableERC20");
        }
        const token = await erc20Token.deploy(name, symbol);
        tradeToken = await token.waitForDeployment();

        payment.token = tradeTokenAddr = await tradeToken.getAddress();
        payment.amount = ethers.parseEther(
          (Math.random() * 3_000_000)
            .toString()
            .split(".")
            .reduce((acc, cur, index) => {
              if (index == 0) {
                acc = cur;
              } else {
                acc + "." + cur.substring(0, 15);
              }

              return acc;
            }, ""),
        );

        for (const tester of testers) {
          await token.mint(
            tester,
            hre.ethers.parseEther(
              (Math.random() * 3_000_000)
                .toString()
                .split(".")
                .reduce((s, c, i) => {
                  if (i == 0) {
                    return s;
                  }

                  s += "." + c.substring(0, 15);

                  return s;
                }, ""),
            ),
          );
        }

        await tradeToken.mint(deployer, payment.amount);
        await tradeToken.approve(await Router.getAddress(), payment.amount);
        await Router.createPair(payment);
      }

      pairAddress = await Router.tokensPairAddress(tradeTokenAddr);
    }
    pairsCount++;

    console.log({ name, pairAddress, payment });
  }

  if (hre.network.name == "localhost") {
    // Send network tokens
    await Promise.all(
      testers.map(async tester =>
        (await ethers.getSigner(deployer)).sendTransaction({ value: parseEther("99"), to: tester }),
      ),
    );
  }
};

export default deployPairs;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags Pairs
deployPairs.tags = ["initialDeployment"];

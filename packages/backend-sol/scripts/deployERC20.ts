import "@nomicfoundation/hardhat-toolbox";
import { task } from "hardhat/config";
import dotenv from "dotenv";

dotenv.config();

task("deployERC20", "")
  .addParam("name", "name")
  .addParam("symbol", "The ticker symbol")
  .setAction(async ({ name, symbol }, hre) => {
    const factory = await hre.ethers.getContractFactory("MintableERC20");

    const token = await factory.deploy(name, symbol);
    await token.waitForDeployment();

    console.log("new token addr: ", await token.getAddress(), await token.symbol(), await token.name());
    const testers = process.env.TESTERS?.split(",") ?? [];
    console.log({ testers });
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
  });

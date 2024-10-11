import "@nomicfoundation/hardhat-toolbox";
import { task } from "hardhat/config";
import { Governance } from "../typechain-types";

task("takeProtocolFees", "takeProtocolFees").setAction(async (_, hre) => {
  const { ethers } = hre;
  const { deployer } = await hre.getNamedAccounts();

  const governance = await ethers.getContract<Governance>("Governance", deployer);
  await governance.takeProtocolFees();
});

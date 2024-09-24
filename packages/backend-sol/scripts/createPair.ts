import "@nomicfoundation/hardhat-toolbox";
import { task } from "hardhat/config";
import { Router } from "../typechain-types";

task("createPair", "Creates new pair via admin interaction")
  .addParam("token", "The token address")
  .addParam("amount", "The initial liquidity amount")
  .setAction(async ({ token, amount }, hre) => {
    const { ethers } = hre;
    const { deployer } = await hre.getNamedAccounts();

    amount = ethers.parseEther(amount);

    const router = await ethers.getContract<Router>("Router", deployer);
    const listingToken = await ethers.getContractAt("ERC20", token);
    const listingPayment = { token, amount, nonce: 0 };

    await listingToken.approve(router, listingPayment.amount);

    await router.createPair(listingPayment);
  });

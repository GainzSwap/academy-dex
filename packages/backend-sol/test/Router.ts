import { expect, use } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { ERC20, Router } from "../typechain-types";
import { ERC20TokenPaymentStruct, Pair } from "../typechain-types/contracts/pair/Pair";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ZeroAddress } from "ethers";

describe("Router", function () {
  async function deployRouterFixture() {
    const [user, owner, ...otherUsers] = await ethers.getSigners();

    // Deploy the PairFactory and Router contracts
    const PairFactory = await ethers.getContractFactory("TestingPairFactory");
    const pairFactoryInstance = await PairFactory.deploy();
    await pairFactoryInstance.waitForDeployment();

    const router = await ethers.deployContract("Router", {
      signer: owner,
      libraries: { PairFactory: await pairFactoryInstance.getAddress() },
    });

    // Create the base pair and get the contract instances
    await router.createPair(ZeroAddress);
    const basePairContract = await ethers.getContractAt("TestingBasePair", await router.basePairAddr());
    const baseTradeToken = await ethers.getContractAt("ADEX", await basePairContract.tradeToken());

    const lpTokenContract = await ethers.getContractAt("LpToken", await router.lpToken());

    // Create a new pair and get the contract instances
    let pairCount = 0;
    const createPair = async () => {
      pairCount++;

      const pairTradeToken = await ethers.deployContract("MintableERC20", ["PairTradeToken", `${pairCount}PTK`], {
        signer: owner,
      });
      await pairTradeToken.mint(user, ethers.parseEther("0.1"));
      await router.connect(owner).createPair(pairTradeToken);
      const pairContract = await ethers.getContractAt("Pair", await router.tokensPairAddress(pairTradeToken));

      return { pairContract, pairTradeToken };
    };

    const addLiquidity = async (
      { tradeToken, contract, signer = user }: { contract: Pair; tradeToken: ERC20; signer?: HardhatEthersSigner },
      ...args: Parameters<Router["addLiquidity"]>
    ) => {
      const payment = args[0] as ERC20TokenPaymentStruct;

      await tradeToken.connect(signer).approve(contract, payment.amount);
      return router.connect(signer).addLiquidity(...args);
    };

    return {
      router,
      basePairContract,
      lpTokenContract,
      createPair,
      baseTradeToken,
      user,
      owner,
      addLiquidity,
      otherUsers,
    };
  }

  describe("addLiquidity", function () {
    it("should add liquidity to a pair", async function () {
      const { basePairContract, baseTradeToken, user, addLiquidity, createPair, owner, lpTokenContract } =
        await loadFixture(deployRouterFixture);

      const { pairContract, pairTradeToken } = await createPair();

      const basePaymentAmount = ethers.parseEther("1");
      const pairPaymentAmount = ethers.parseEther("1");

      // Mint tokens for liquidity
      await baseTradeToken.connect(owner).transfer(user, basePaymentAmount);
      await pairTradeToken.mint(user, pairPaymentAmount);

      const basePayment = { amount: basePaymentAmount, token: baseTradeToken };
      const pairPayment = { amount: pairPaymentAmount, token: pairTradeToken };

      // Add liquidity to the base pair
      const initialAdexBal = await baseTradeToken.balanceOf(basePairContract);
      await addLiquidity({ contract: basePairContract, tradeToken: baseTradeToken }, basePayment);
      expect(await basePairContract.reserve()).to.equal(basePayment.amount);

      // Add liquidity to the created pair
      await addLiquidity({ contract: pairContract, tradeToken: pairTradeToken }, pairPayment);
      expect(await pairContract.reserve()).to.equal(pairPayment.amount);

      // Check that the liquidity was correctly added to the contract's balance
      expect(await baseTradeToken.balanceOf(basePairContract)).to.equal(basePayment.amount + initialAdexBal);
      expect(await pairTradeToken.balanceOf(pairContract)).to.equal(pairPayment.amount);

      // LP token should be minted
      const [lpOne, lpTwo, ...otherLps] = await lpTokenContract.lpBalanceOf(user);
      expect(otherLps.length).to.equal(0);

      expect(lpOne.amount > 0).to.equal(true);
      expect(lpOne.attributes.pair).to.equal(basePairContract);

      expect(lpTwo.amount > 0).to.equal(true);
      expect(lpTwo.attributes.pair).to.equal(pairContract);
    });

    it("should fail to add liquidity if the pair does not exist", async function () {
      const {
        router,
        user,
        otherUsers: [, , notPair],
      } = await loadFixture(deployRouterFixture);

      const payment = { amount: ethers.parseEther("1"), token: notPair };

      await expect(router.connect(user).addLiquidity(payment)).to.be.revertedWith("Router: Invalid pair address");
    });

    it("should revert if liquidity amount is zero", async function () {
      const { basePairContract, baseTradeToken, addLiquidity } = await loadFixture(deployRouterFixture);

      const basePayment = { amount: ethers.parseEther("0"), token: baseTradeToken };

      await expect(
        addLiquidity({ contract: basePairContract, tradeToken: baseTradeToken }, basePayment),
      ).to.be.revertedWith("Pair: Bad received payment");
    });
  });
});

import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { BigNumberish, ZeroAddress } from "ethers";
import { ERC20TokenPaymentStruct, Pair } from "../typechain-types/contracts/pair/Pair";
import { MintableERC20, Router } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("Pair", function () {
  async function deployPairFixture() {
    const [user, owner, ...otherUsers] = await ethers.getSigners();

    const router = await ethers.deployContract("TestingRouter", { signer: owner });

    await router.connect(owner).createPair(ZeroAddress);

    const basePairContract = await ethers.getContractAt("TestingBasePair", await router.basePairAddr());
    const baseTradeToken = await ethers.getContractAt("MintableERC20", await basePairContract.tradeToken());
    await basePairContract.mint(user, ethers.parseEther("3000000.4456"));

    let pairCount = 0;
    const createPair = async () => {
      pairCount++;

      const pairTradeToken = await ethers.deployContract("TestingERC20", ["PairTradeToken", pairCount + "PTK"], {
        signer: owner,
      });
      await pairTradeToken.mint(user, ethers.parseEther("3000000.4456"));
      await router.connect(owner).createPair(pairTradeToken);
      const pairContract = await ethers.getContractAt("Pair", await router.tokensPairAddress(pairTradeToken));

      return { pairContract, pairTradeToken };
    };

    const { pairContract, pairTradeToken } = await createPair();

    const addLiquidity = async (
      {
        tradeToken,
        contract,
        signer = user,
      }: { contract: Pair; tradeToken: MintableERC20; signer?: HardhatEthersSigner },
      ...args: Parameters<Router["addLiquidity"]>
    ) => {
      const payment = args[0] as ERC20TokenPaymentStruct;

      await tradeToken.connect(signer).approve(contract, payment.amount);
      return router.connect(signer).addLiquidity(...args);
    };
    const addInitialLiq = async ({ baseAmt, pairAmt }: { baseAmt: number; pairAmt: number }) => {
      const basePayment = { amount: baseAmt, token: baseTradeToken };
      const pairPayment = { amount: pairAmt, token: pairTradeToken };

      await addLiquidity({ contract: basePairContract, tradeToken: baseTradeToken }, basePayment);
      expect(await basePairContract.reserve()).to.equal(basePayment.amount);

      await addLiquidity({ contract: pairContract, tradeToken: pairTradeToken }, pairPayment);
      expect(await pairContract.reserve()).to.equal(pairPayment.amount);

      expect(await baseTradeToken.balanceOf(basePairContract)).to.equal(basePayment.amount);
      expect(await pairTradeToken.balanceOf(pairContract)).to.equal(pairPayment.amount);
    };

    const sellToken = async ({
      buyContract,
      sellAmt,
      sellContract,
      someUser = user,
    }: {
      buyContract: Pair;
      sellContract: Pair;
      sellAmt: BigNumberish;
      someUser?: HardhatEthersSigner;
    }) => {
      const buyToken = await ethers.getContractAt("ERC20", await buyContract.tradeToken());
      const sellToken = await ethers.getContractAt("ERC20", await sellContract.tradeToken());
      await sellToken.connect(someUser).approve(sellContract, sellAmt);

      const initialReward = await buyContract.rewards();
      const initialOutBal = await buyToken.balanceOf(someUser);
      const initialInBal = await sellToken.balanceOf(someUser);

      await sellContract.connect(someUser).sell({ token: sellToken, amount: sellAmt }, buyContract, 1_00);

      const finalReward = await buyContract.rewards();
      const finalOutBal = await buyToken.balanceOf(someUser);
      const finalInBal = await sellToken.balanceOf(someUser);

      [
        [finalOutBal, initialOutBal],
        [finalReward, initialReward],
        [initialInBal, finalInBal],
      ].forEach(([bigger, smaller]) => {
        expect(bigger > smaller).to.equal(true);
      });
    };

    return {
      router,
      basePairContract,
      pairContract,
      pairTradeToken,
      baseTradeToken,
      user,
      otherUsers,
      addLiquidity,
      addInitialLiq,
      createPair,
      sellToken,
    };
  }

  it("testPairSetup", async () => {
    const { basePairContract } = await loadFixture(deployPairFixture);

    expect(await basePairContract.lpSupply()).to.equal("0");
  });

  describe("addLiquidity", function () {
    it("adds initial liquity for base and pair contracts", async function () {
      const { addInitialLiq } = await loadFixture(deployPairFixture);

      await addInitialLiq({ baseAmt: 4_000, pairAmt: 50_000 });
    });
  });

  describe("sell", function () {
    it("can sell token", async () => {
      const {
        addInitialLiq,
        sellToken,
        otherUsers: [, , someUser],
        pairContract,
        pairTradeToken,
        basePairContract,
        baseTradeToken,
      } = await loadFixture(deployPairFixture);
      const runAssert = (args: { buyContract: Pair; sellContract: Pair; sellAmt: BigNumberish }) =>
        sellToken({ ...args, someUser });
      await addInitialLiq({ baseAmt: 15_000_000, pairAmt: 15_000_000 });

      const sellAmt = 7000n;
      await pairTradeToken.mint(someUser, sellAmt);

      await runAssert({ buyContract: basePairContract, sellAmt, sellContract: pairContract });
      const baseTokenAmt = await baseTradeToken.balanceOf(someUser);
      await runAssert({
        buyContract: pairContract,
        sellAmt: baseTokenAmt,
        sellContract: basePairContract,
      });
    });

    it("can sell tokens", async () => {
      const {
        addInitialLiq,
        addLiquidity,
        pairContract: firstPairContract,
        basePairContract,
        createPair,
        sellToken,
      } = await loadFixture(deployPairFixture);
      await addInitialLiq({ baseAmt: 15_000_000, pairAmt: 900_000_000 });

      await sellToken({ buyContract: basePairContract, sellContract: firstPairContract, sellAmt: 7000 });

      // Create new pair
      const { pairContract: secondPairContract, pairTradeToken: secondTradeToken } = await createPair();
      await addLiquidity(
        { tradeToken: secondTradeToken, contract: secondPairContract },
        { amount: 80_000_000, token: secondTradeToken },
      );

      await sellToken({ buyContract: firstPairContract, sellContract: secondPairContract, sellAmt: 7000 });
      await sellToken({ buyContract: secondPairContract, sellContract: basePairContract, sellAmt: 7000 });
    });
  });
});

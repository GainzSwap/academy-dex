import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { BigNumberish, parseEther, ZeroAddress } from "ethers";
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
    await basePairContract.mint(user, ethers.parseEther("0.1"));

    let pairCount = 0;
    const createPair = async () => {
      pairCount++;

      const pairTradeToken = await ethers.deployContract("TestingERC20", ["PairTradeToken", pairCount + "PTK"], {
        signer: owner,
      });
      await pairTradeToken.mint(user, ethers.parseEther("0.1"));
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
    const addInitialLiq = async ({ baseAmt, pairAmt }: { baseAmt: BigNumberish; pairAmt: BigNumberish }) => {
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
      slippage = 1_00,
    }: {
      buyContract: Pair;
      sellContract: Pair;
      sellAmt: BigNumberish;
      someUser?: HardhatEthersSigner;
      slippage?: number;
    }) => {
      const buyToken = await ethers.getContractAt("ERC20", await buyContract.tradeToken());
      const sellToken = await ethers.getContractAt("ERC20", await sellContract.tradeToken());
      await sellToken.connect(someUser).approve(sellContract, sellAmt);

      const basePairAddr = await basePairContract.getAddress();
      const buyPairAddr = await buyContract.getAddress();
      const computeBuyTradeBal = (bal: bigint, rewards: bigint) => (buyPairAddr == basePairAddr ? bal - rewards : bal);

      const initialReward = await buyContract.rewards();
      const initialBuyTradeBal = await buyToken
        .balanceOf(buyContract)
        .then(value => computeBuyTradeBal(value, initialReward));
      const initialOutBal = await buyToken.balanceOf(someUser);
      const initialInBal = await sellToken.balanceOf(someUser);

      await router.connect(someUser).swap({ token: sellToken, amount: sellAmt }, sellContract, buyContract, slippage);

      const finalReward = await buyContract.rewards();
      const finalBuyTradeBal = await buyToken
        .balanceOf(buyContract)
        .then(value => computeBuyTradeBal(value, finalReward));
      const finalOutBal = await buyToken.balanceOf(someUser);
      const finalInBal = await sellToken.balanceOf(someUser);

      [
        [finalOutBal, initialOutBal],
        [finalReward, initialReward],
        [initialInBal, finalInBal],
        [initialBuyTradeBal, finalBuyTradeBal],
      ].forEach(([bigger, smaller], index) => {
        expect(bigger > smaller).to.equal(true, `Expected balance comparison after sale fialed at index: ${index}`);
      });
    };

    return {
      router,
      basePairContract,
      pairContract,
      pairTradeToken,
      baseTradeToken,
      user,
      owner,
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

    it("keeps minting of base pair in a sensible valuation", async () => {
      const {
        pairContract,
        basePairContract,
        baseTradeToken,
        pairTradeToken,
        user,
        addInitialLiq,
        sellToken,
        createPair,
        addLiquidity,
        otherUsers: [, , , , otherUser, someUser],
      } = await loadFixture(deployPairFixture);
      let pairAmt = 3_000_000;
      const baseAmt = parseEther(pairAmt.toString());
      await basePairContract.mint(user, baseAmt);
      await addInitialLiq({ baseAmt, pairAmt });
      const _format = (n: bigint) => format(n, 0);

      while (pairAmt > 0) {
        const sellAmt = 500_000;
        pairAmt -= sellAmt;

        await pairTradeToken.mint(someUser, sellAmt);
        await sellToken({
          buyContract: basePairContract,
          sellAmt,
          sellContract: pairContract,
          slippage: 100_00,
          someUser,
        });
        let userBaseTokenBal = await baseTradeToken.balanceOf(someUser);
        await sellToken({
          buyContract: pairContract,
          sellAmt: userBaseTokenBal,
          sellContract: basePairContract,
          slippage: 100_00,
          someUser,
        });
        let userPairTokenBal = await pairTradeToken.balanceOf(someUser);
        if (pairAmt <= 0) {
          await sellToken({
            buyContract: basePairContract,
            sellAmt: userPairTokenBal,
            sellContract: pairContract,
            slippage: 100_00,
            someUser,
          });
        }
        userPairTokenBal = await pairTradeToken.balanceOf(someUser);
        userBaseTokenBal = await baseTradeToken.balanceOf(someUser);

        const pairTradingReserve = await pairContract.reserve();
        const basePairRewards = await basePairContract.rewards();
        const pairRewards = await pairContract.rewards();
        // console.log({
        //   rewards: {
        //     basePairRewards: _format(basePairRewards),
        //     pairRewards: _format(pairRewards),
        //     totalMintedBaseToken: _format(basePairRewards + pairRewards),
        //   },
        //   userBaseTokenBal: _format(userBaseTokenBal),
        //   userPairTokenBal: _format(userPairTokenBal),
        //   pairTradingReserve: _format(pairTradingReserve),
        // });
        // console.log("base supply: ", format(await baseTradeToken.totalSupply()));
      }

      // Create new pair
      const { pairContract: secondPairContract, pairTradeToken: secondTradeToken } = await createPair();
      const amount = parseEther((0.8).toString());
      await secondTradeToken.mint(otherUser, amount);
      await addLiquidity(
        { tradeToken: secondTradeToken, contract: secondPairContract, signer: otherUser },
        { amount, token: secondTradeToken },
      );
      for (let i = 0; i < 15; i++) {
        let sellAmt = parseEther((0.07 * (i + 1)).toString().substring(0, 19));

        await secondTradeToken.mint(otherUser, sellAmt);
        await sellToken({
          buyContract: pairContract,
          sellContract: secondPairContract,
          sellAmt,
          slippage: 100_00,
          someUser: otherUser,
        });

        if (i % 5 == 0) {
          const { pairContract: contract, pairTradeToken: tradeToken } = await createPair();
          await addLiquidity({ tradeToken, contract }, { amount: 80_000_000, token: tradeToken });
        }
        // console.log("base supply: ", format(await baseTradeToken.totalSupply()));
        // console.log("pairRewards: ", format(await pairContract.rewards()));
      }
    });
  });
});

function format(n: bigint, decimals = 18) {
  const isNeg = n < 0n;
  isNeg && (n = -1n * n);

  const one = BigInt(10 ** decimals);
  const int = n / one;
  const mts = (int > 0 ? n - int * one : n).toString().padStart(decimals, "0");

  return (
    (isNeg ? "-" : "") +
    int
      .toString()
      .replace(/^0{2,}/, "")
      .split("")
      .reverse()
      .reduce((a, c, i) => {
        i >= 3 && i % 3 == 0 && (a = "," + a);
        a = c + a;

        return a;
      }, ".") +
    mts
  );
}

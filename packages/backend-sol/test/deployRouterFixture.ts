import { BigNumberish, ZeroAddress } from "ethers";
import { ethers } from "hardhat";
import { ERC20, Pair, Router } from "../typechain-types";
import { ERC20TokenPaymentStruct } from "../typechain-types/contracts/pair/BasePair";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { expect } from "chai";

export default async function deployRouterFixture() {
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

  const sellToken = async ({
    buyContract,
    sellAmt,
    sellContract,
    someUser = user,
    slippage = 1_00,
    mint = false,
  }: {
    buyContract: Pair;
    sellContract: Pair;
    sellAmt: BigNumberish;
    someUser?: HardhatEthersSigner;
    slippage?: number;
    mint?: boolean;
  }) => {
    const buyToken = await ethers.getContractAt("ERC20", await buyContract.tradeToken());
    const sellToken = await ethers.getContractAt("MintableERC20", await sellContract.tradeToken());
    mint && (await sellToken.connect(owner).mint(someUser, sellAmt));

    const tokenApprovalTx = await sellToken.connect(someUser).approve(sellContract, sellAmt);
    await tokenApprovalTx.wait();

    // const basePairAddr = await basePairContract.getAddress();
    // const buyPairAddr = await buyContract.getAddress();
    // const computeBuyTradeBal = (bal: bigint, rewards: bigint) => (buyPairAddr == basePairAddr ? bal - rewards : bal);

    // const initialReward = await buyContract.rewards();
    const initialBuyTradeBal = await buyToken.balanceOf(buyContract);
    // .then(value => computeBuyTradeBal(value, initialReward));
    const initialOutBal = await buyToken.balanceOf(someUser);
    const initialInBal = await sellToken.balanceOf(someUser);

    await expect(router.connect(someUser).swap({ token: sellToken, amount: sellAmt }, buyContract, slippage)).to.emit(
      buyContract,
      "BurntFees",
    );

    // const finalReward = await buyContract.rewards();
    const finalBuyTradeBal = await buyToken.balanceOf(buyContract);
    // .then(value => computeBuyTradeBal(value, finalReward));
    const finalOutBal = await buyToken.balanceOf(someUser);
    const finalInBal = await sellToken.balanceOf(someUser);

    [
      [finalOutBal, initialOutBal],
      // [finalReward, initialReward],
      [initialInBal, finalInBal],
      [initialBuyTradeBal, finalBuyTradeBal],
    ].forEach(([bigger, smaller], index) => {
      expect(bigger > smaller).to.equal(true, `Expected balance comparison after sale fialed at index: ${index}`);
    });
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
    sellToken,
    otherUsers,
  };
}

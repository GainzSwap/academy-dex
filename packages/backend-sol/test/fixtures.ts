import { BigNumberish, parseEther, ZeroAddress } from "ethers";
import { ethers } from "hardhat";
import { ERC20, MintableERC20, Pair, Router } from "../typechain-types";
import { ERC20TokenPaymentStruct } from "../typechain-types/contracts/pair/BasePair";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { expect } from "chai";
import { TokenPaymentStruct } from "../typechain-types/contracts/governance/Governance";

// Helper function for token approval
async function approveToken(signer: HardhatEthersSigner, token: ERC20, amount: BigNumberish, contract: Pair) {
  await token.connect(signer).approve(contract, amount);
}

export async function deployRouterFixture() {
  const [user, owner, ...otherUsers] = await ethers.getSigners();

  // Deploy contracts and ensure they are deployed
  const PairFactory = await ethers.getContractFactory("TestingPairFactory");
  const pairFactoryInstance = await PairFactory.deploy();
  await pairFactoryInstance.waitForDeployment();

  const DeployGovernanceFactory = await ethers.getContractFactory("DeployGovernance", {
    libraries: {
      NewGTokens: await (await ethers.deployContract("NewGTokens")).getAddress(),
    },
  });
  const deployGovernance = await DeployGovernanceFactory.deploy();
  await deployGovernance.waitForDeployment();

  const router = await ethers.deployContract("Router", {
    signer: owner,
    libraries: {
      PairFactory: await pairFactoryInstance.getAddress(),
      DeployGovernance: await deployGovernance.getAddress(),
    },
  });

  await router.createPair(ZeroAddress);
  const basePairContract = await ethers.getContractAt("TestingBasePair", await router.basePairAddr());
  const baseTradeToken = await ethers.getContractAt("MintableADEX", await basePairContract.tradeToken());

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
    {
      tradeToken,
      contract,
      signer = user,
    }: { contract: Pair; tradeToken: MintableERC20; signer?: HardhatEthersSigner },
    ...args: Parameters<Router["addLiquidity"]>
  ) => {
    const payment = args[0] as ERC20TokenPaymentStruct;
    await tradeToken.connect(owner).mint(signer, payment.amount);
    await approveToken(signer, tradeToken, payment.amount, contract);
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

    const estimatedAmountOut = await router.estimateOutAmount(sellContract, buyContract, sellAmt, slippage);

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

    expect(estimatedAmountOut).to.be.lessThanOrEqual(finalOutBal - initialOutBal);
  };

  const governanceContract = await ethers.getContractAt("Governance", await router.governance());

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
    approveToken,
    governanceContract,
  };
}

export async function claimRewardsFixture() {
  const {
    router,
    user,
    basePairContract,
    createPair,
    baseTradeToken: adex,
    owner,
    addLiquidity,
    governanceContract,
    lpTokenContract,
    ...fixtures
  } = await deployRouterFixture();

  // Get the GTokens contract instance
  const gTokensAddress = await governanceContract.gtokens();
  const gTokens = await ethers.getContractAt("GTokens", gTokensAddress);

  const { pairContract, pairTradeToken } = await createPair();

  const addInitialLiq = async ({ baseAmt, pairAmt }: { baseAmt: BigNumberish; pairAmt: BigNumberish }) => {
    const basePayment = { amount: baseAmt, token: adex };
    const pairPayment = { amount: pairAmt, token: pairTradeToken };

    await adex.connect(owner).transfer(user, baseAmt);
    const initialAdexBal = await adex.balanceOf(basePairContract);
    await addLiquidity({ contract: basePairContract, tradeToken: adex }, basePayment);
    expect(await basePairContract.reserve()).to.equal(basePayment.amount);

    await pairTradeToken.mint(user, pairAmt);
    await addLiquidity({ contract: pairContract, tradeToken: pairTradeToken }, pairPayment);
    expect(await pairContract.reserve()).to.equal(pairPayment.amount);

    expect(await adex.balanceOf(basePairContract)).to.equal(BigInt(basePayment.amount) + initialAdexBal);
    expect(await pairTradeToken.balanceOf(pairContract)).to.equal(pairPayment.amount);
  };

  await addInitialLiq({ baseAmt: parseEther("7284.4846"), pairAmt: parseEther("745334000.4746") });

  const addLiquidityAndEnterGovernance = async (
    times: number,
    signer = user,
    otherParams: { epochsLocked?: number } = {},
  ) => {
    if (otherParams.epochsLocked == undefined) {
      otherParams.epochsLocked = 120;
    }

    while (times > 0) {
      times--;
      // User adds liquidity
      await addLiquidity(
        { tradeToken: pairTradeToken, contract: pairContract, signer },
        { token: pairTradeToken, amount: parseEther("500") },
      );
      await addLiquidity(
        { tradeToken: adex, contract: basePairContract, signer },
        { token: adex, amount: parseEther("900") },
      );
    }

    // User enters governance
    const lpContractAddr = await lpTokenContract.getAddress();
    const lpPayments: TokenPaymentStruct[] = await lpTokenContract
      .lpBalanceOf(signer)
      .then(balances => balances.map(({ amount, nonce }) => ({ amount, nonce, token: lpContractAddr })));
    await lpTokenContract.connect(signer).setApprovalForAll(governanceContract, true);
    await governanceContract.connect(signer).enterGovernance(lpPayments, otherParams.epochsLocked);

    return lpPayments;
  };

  const computeLpBalance = <T extends { amount: BigNumberish }>(payments: T[]) =>
    payments.reduce((acc, cur) => acc + BigInt(cur.amount), 0n);

  return {
    ...fixtures,
    lpTokenContract,
    governanceContract,
    computeLpBalance,
    addLiquidityAndEnterGovernance,
    LISTING_FEE: await governanceContract.LISTING_FEE(),
    adex,
    router,
    user,
    basePairContract,
    createPair,
    owner,
    pairContract,
    pairTradeToken,
    addLiquidity,
    gTokens,
    gTokensAddress,
    epochLength: (await governanceContract.epochs()).epochLength,
  };
}

import { AddressLike, BigNumberish, parseEther, ZeroAddress } from "ethers";
import { ethers } from "hardhat";
import { ADEX, EDUPair, ERC20, MintableERC20, Pair, Router, WEDU } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { expect } from "chai";
import { TokenPaymentStruct } from "../typechain-types/contracts/governance/Governance";
import { BasePair } from "../typechain-types/contracts/pair/BasePair.sol";

type Pairish = Pair | BasePair | EDUPair;

// Helper function for token approval
async function approveToken(signer: HardhatEthersSigner, token: ERC20, amount: BigNumberish, contract: Pairish) {
  await token.connect(signer).approve(contract, amount);
}

export async function deployRouterFixture() {
  const [user, owner, ...otherUsers] = await ethers.getSigners();

  // Deploy contracts and ensure they are deployed
  const PairFactory = await ethers.getContractFactory("DeployPair");
  const pairFactoryInstance = await PairFactory.deploy();
  await pairFactoryInstance.waitForDeployment();

  const DeployGovernanceFactory = await ethers.getContractFactory("DeployGovernance", {
    libraries: {
      NewGTokens: await (await ethers.deployContract("NewGTokens")).getAddress(),
      DeployLaunchPair: await (await ethers.deployContract("DeployLaunchPair")).getAddress(),
      GovernanceLib: await (await ethers.deployContract("GovernanceLib")).getAddress(),
    },
  });
  const deployGovernance = await DeployGovernanceFactory.deploy();
  await deployGovernance.waitForDeployment();

  const router = await ethers.deployContract("Router", {
    signer: owner,
    libraries: {
      DeployLpToken: await (await ethers.deployContract("DeployLpToken")).getAddress(),
      DeployPair: await (await ethers.deployContract("DeployPair")).getAddress(),
      DeployBasePair: await (await ethers.deployContract("DeployBasePair")).getAddress(),
      DeployEduPair: await (await ethers.deployContract("DeployEduPair")).getAddress(),
      DeployGovernance: await deployGovernance.getAddress(),
    },
  });
  await router.initialize(owner);

  await router.createPair({ amount: 0, token: ZeroAddress, nonce: 0 });
  const basePairAddr = await router.basePairAddr();
  const basePairContract = await ethers.getContractAt("Pair", basePairAddr);
  const baseTradeToken = await ethers.getContractAt("ADEX", await basePairContract.tradeToken());

  // Check lisiting of EDU
  const transferAmt = parseEther("34");
  await router.createPair({ token: ZeroAddress, amount: 0, nonce: 0 }, { value: transferAmt });
  const wEDUaddress = await router.getWEDU();
  const WEDU = await ethers.getContractAt("WEDU", wEDUaddress);
  const eduPair = await ethers.getContractAt("EDUPair", (await router.getAllPairs()).at(-1)!);

  expect(await WEDU.balanceOf(eduPair)).to.be.eq(transferAmt);
  const lpTokenContract = await ethers.getContractAt("LpToken", await router.lpToken());

  // Create a new pair and get the contract instances
  let pairCount = 0;
  const createPair = async (args: { initLiq?: BigNumberish } = {}) => {
    pairCount++;
    const pairTradeToken = await ethers.deployContract("MintableERC20", ["PairTradeToken", `${pairCount}PTK`], {
      signer: owner,
    });

    if (args.initLiq == undefined) {
      args.initLiq = ethers.parseEther("100000000");
    }

    const payment = { nonce: 0, amount: args.initLiq, token: pairTradeToken };
    await pairTradeToken.mint(owner, payment.amount);
    await pairTradeToken.connect(owner).approve(router, payment.amount);

    await router.connect(owner).createPair(payment);
    const pairContract = await ethers.getContractAt("Pair", await router.tokensPairAddress(pairTradeToken));

    return { pairContract, pairTradeToken };
  };

  const addLiquidity = async (
    {
      tradeToken,
      contract,
      signer = user,
    }: { contract: Pair | BasePair | EDUPair; tradeToken?: MintableERC20 | ADEX | WEDU; signer?: HardhatEthersSigner },
    ...args: Parameters<Router["addLiquidity"]>
  ) => {
    const payment = args[0] as TokenPaymentStruct;
    if (tradeToken) {
      "mint" in tradeToken
        ? await tradeToken.connect(owner).mint(signer, payment.amount)
        : await tradeToken.connect(owner).transfer(signer, payment.amount);
      await approveToken(signer, tradeToken, payment.amount, contract);
    }
    return router.connect(signer).addLiquidity(...args);
  };

  const sellToken = async ({
    buyContract,
    sellAmt,
    sellContract,
    someUser = user,
    slippage = 1_00,
    mint = false,
    checkBalances = true,
  }: {
    buyContract: Pairish;
    sellContract: Pairish;
    sellAmt: BigNumberish;
    someUser?: HardhatEthersSigner;
    slippage?: number;
    mint?: boolean;
    checkBalances?: boolean;
  }) => {
    const buyToken = await ethers.getContractAt("ERC20", await buyContract.tradeToken());
    const sellToken =
      (await sellContract.getAddress()) == basePairAddr
        ? baseTradeToken
        : await ethers.getContractAt("MintableERC20", await sellContract.tradeToken());

    if (mint) {
      "mint" in sellToken
        ? await sellToken.connect(owner).mint(someUser, sellAmt)
        : await sellToken.connect(owner).transfer(someUser, sellAmt);
    }

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

    await expect(
      router.connect(someUser).swap({ token: sellToken, amount: sellAmt, nonce: 0 }, buyContract, slippage),
    ).to.emit(buyContract, "BurntFees");

    // const finalReward = await buyContract.rewards();
    const finalBuyTradeBal = await buyToken.balanceOf(buyContract);
    // .then(value => computeBuyTradeBal(value, finalReward));
    const finalOutBal = await buyToken.balanceOf(someUser);
    const finalInBal = await sellToken.balanceOf(someUser);

    if (checkBalances) {
      [
        [finalOutBal, initialOutBal],
        // [finalReward, initialReward],
        [initialInBal, finalInBal],
        [initialBuyTradeBal, finalBuyTradeBal],
      ].forEach(([bigger, smaller], index) => {
        expect(bigger > smaller).to.equal(true, `Expected balance comparison after sale fialed at index: ${index}`);
      });

      expect(estimatedAmountOut).to.be.lessThanOrEqual(finalOutBal - initialOutBal);
    }
  };

  const governanceContract = await ethers.getContractAt("Governance", await router.governance());
  const launchPairContract = await ethers.getContractAt("LaunchPair", await governanceContract.launchPair());

  return {
    router,
    WEDU,
    wEDUaddress,
    eduPair,
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
    launchPairContract,
    getLpNonces: (address: AddressLike) =>
      lpTokenContract.getNonces(address).then(async nonces => {
        // console.log("\n\n", await time.latest(), " :");

        return nonces.map(nonce => {
          // console.log(nonce);
          return nonce;
        });
      }),
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

  const addLiquidityAndEnterGovernance = async (
    times: number,
    signer = user,
    otherParams: { epochsLocked?: number; adexAmount?: BigNumberish; otherPairAmount?: BigNumberish } = {},
  ) => {
    if (otherParams.epochsLocked == undefined) {
      otherParams.epochsLocked = 1080;
    }
    if (otherParams.adexAmount == undefined) {
      otherParams.adexAmount = parseEther("900");
    }
    if (otherParams.otherPairAmount == undefined) {
      otherParams.otherPairAmount = parseEther("0.000005");
    }

    const { epochsLocked, adexAmount, otherPairAmount } = otherParams;

    while (times > 0) {
      times--;
      // User adds liquidity
      await addLiquidity(
        { tradeToken: pairTradeToken, contract: pairContract, signer },
        { token: pairTradeToken, amount: otherPairAmount, nonce: 0 },
      );
      await addLiquidity(
        { tradeToken: adex, contract: basePairContract, signer },
        { token: adex, amount: adexAmount, nonce: 0 },
      );
    }

    // User enters governance
    const lpContractAddr = await lpTokenContract.getAddress();
    const lpPayments: TokenPaymentStruct[] = await lpTokenContract
      .lpBalanceOf(signer)
      .then(balances => balances.map(({ amount, nonce }) => ({ amount, nonce, token: lpContractAddr })));
    await lpTokenContract.connect(signer).setApprovalForAll(governanceContract, true);
    await governanceContract.connect(signer).enterGovernance(lpPayments, epochsLocked);

    return lpPayments;
  };

  const computeLpBalance = <T extends { amount: BigNumberish }>(payments: T[]) =>
    payments.reduce((acc, cur) => acc + BigInt(cur.amount), 0n);

  await addLiquidity(
    { contract: pairContract, tradeToken: pairTradeToken, signer: user },
    { token: pairTradeToken, nonce: 0, amount: parseEther("0.094") },
  );

  return {
    ...fixtures,
    lpTokenContract,
    governanceContract,
    computeLpBalance,
    addLiquidityAndEnterGovernance,
    LISTING_FEE: await governanceContract.listing_fees(),
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

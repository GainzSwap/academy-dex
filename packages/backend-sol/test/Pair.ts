import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture, time } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { ZeroAddress } from "ethers";
import { ERC20TokenPaymentStruct, Pair } from "../typechain-types/contracts/pair/Pair";
import { TestingERC20 } from "../typechain-types";

const randomAddress = () => ethers.Wallet.createRandom().address;

describe("Pair", function () {
  async function deployPairFixture() {
    const baseTradeToken = await ethers.deployContract("TestingERC20", ["BaseTradeToken", "BASE"]);
    const pairTradeToken = await ethers.deployContract("TestingERC20", ["PairTradeToken", "PTK"]);

    const router = await ethers.deployContract('Router');

    const basePairContract = await ethers.deployContract("BasePair", [baseTradeToken]);
    const pairContract = await ethers.deployContract("Pair", [pairTradeToken, basePairContract]);

    const [owner] = await ethers.getSigners();

    return {
      basePairContract,
      pairContract,
      pairTradeToken,
      baseTradeToken,
      owner,
      addLiquidity: async (
        { tradeToken, contract }: { contract: Pair; tradeToken: TestingERC20 },
        ...args: Parameters<Pair["addLiquidity"]>
      ) => {
        const payment = args[0] as ERC20TokenPaymentStruct;

        await tradeToken.approve(contract, payment.amount);
        return contract.addLiquidity(...args);
      },
    };
  }

  it("testPairSetup", async () => {
    const { basePairContract } = await loadFixture(deployPairFixture);

    expect(await basePairContract.lpSupply()).to.equal("0");
  });

  describe("addLiquidity", function () {
    it("can add liquity", async function () {
      const { basePairContract, addLiquidity, baseTradeToken, pairContract, pairTradeToken } =
        await loadFixture(deployPairFixture);
      const basePayment = { amount: 4_000, token: baseTradeToken };
      const pairPayment = { amount: 50_000, token: pairTradeToken };

      await addLiquidity({ contract: basePairContract, tradeToken: baseTradeToken }, basePayment);
      await addLiquidity({ contract: pairContract, tradeToken: pairTradeToken }, pairPayment);

      expect(await baseTradeToken.balanceOf(basePairContract)).to.equal(basePayment.amount);
      expect(await pairTradeToken.balanceOf(pairContract)).to.equal(pairPayment.amount);
    });
  });
});

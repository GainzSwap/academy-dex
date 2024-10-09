import { ChainID, wagmiConfigServer } from "../bot/service";
import { faucetConfig } from "../constants";
import BigNumber from "bignumber.js";
import { erc20Abi, parseEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { getBlock, readContract, sendTransaction, writeContract } from "wagmi/actions";
import deployedContracts from "~~/contracts/deployedContracts";
import { FaucetEntry } from "~~/drizzle/schema/models/FaucetEntry";
import { User } from "~~/drizzle/schema/models/User";

const config = faucetConfig;
const minClaim = parseEther(BigNumber(config.minClaim).toFixed());
const faucetAccount = privateKeyToAccount(faucetConfig.faucetPrivateKey as any);

export async function sendSeed({ address, chainId }: { address: string; chainId: ChainID }) {
  if (!config.active) return false;

  const entry = (await FaucetEntry.findOneBy({ address })) ?? new FaucetEntry({});
  if (!entry.address) {
    try {
      // save the entry so we will not send again
      entry.address = address;
      await FaucetEntry.save(entry, true);

      // Claim first tranche..
      await valueFor({ address, chainId, claim: true });
    } catch (error: any) {
      console.error(error.response?.data || error.message || error);
    }

    return true;
  }

  return false;
}

async function sendTokens({ amount, chainId, toAddress }: { toAddress: string; amount: bigint; chainId: ChainID }) {
  const wagmiConfig = wagmiConfigServer(chainId);
  const Router = deployedContracts[chainId].Router;

  const dexTokens = await readContract(wagmiConfig, {
    abi: Router.abi,
    address: Router.address,
    functionName: "tradeableTokens",
  });
  const dexTokensBalances = await Promise.all(
    dexTokens.map(token =>
      readContract(wagmiConfig, {
        abi: erc20Abi,
        address: token,
        functionName: "balanceOf",
        args: [faucetAccount.address],
      }),
    ),
  );

  // Send native coin
  // await sendTransaction(wagmiConfig, { account: faucetAccount, to: toAddress, value: amount });
  for (let index = 0; index++; index < dexTokens.length) {
    const token = dexTokens[index];
    const balance = dexTokensBalances[index];
    if (balance > amount) {
      console.error(
        `Faucet balance for ${token} not enough. Want to send ${amount}, has ${balance}. ChainID: ${chainId}`,
      );
      continue;
    }

    console.log(`FAUCET: Sending ${amount} of ${token} to ${toAddress}`);
    await writeContract(wagmiConfig, {
      abi: erc20Abi,
      address: token,
      functionName: "transfer",
      args: [toAddress, amount],
    });
  }
}

export async function valueFor({
  address,
  claim = false,
  chainId,
}: {
  address: string;
  claim?: boolean;
  chainId: ChainID;
}) {
  if (!config.active) {
    return {
      active: config.active,
      claimable: "0",
      nextClaimTimestamp: Number.MAX_SAFE_INTEGER,
    };
  }

  const entry = await FaucetEntry.findOneBy({ address });

  if (!entry) {
    throw new Error("Faucet entry not created for " + address);
  }

  const maxClaim = parseEther(BigNumber(config.maxClaim).toFixed());

  // const Router = deployedContracts[chainId].Router;

  const wagmiConfig = wagmiConfigServer(chainId);
  const totalDirectReferred =
    // await readContract(wagmiConfig, {
    //   abi: Router.abi,
    //   address: Router.address,
    //   functionName: "getReferrals",
    //   args: [address],
    // }).length
    (await User.findOneBy({ address }))?.referrals?.length || 0;

  let claimable = minClaim + parseEther(BigNumber(totalDirectReferred * config.increasePerProfile).toFixed());
  claimable > maxClaim && (claimable = maxClaim);

  if (claim) {
    const { timestamp } = await getBlock(wagmiConfig);

    if (timestamp < entry.nextClaimTimestamp) {
      throw new Error("Next Faucet claim not reached");
    }

    await sendTokens({ toAddress: address, amount: claimable, chainId });

    entry.nextClaimTimestamp = +timestamp.toString() + config.faucetInterval;

    await FaucetEntry.save(entry);
  }

  return {
    active: config.active,
    claimable: claimable.toString(),
    nextClaimTimestamp: entry.nextClaimTimestamp,
  };
}

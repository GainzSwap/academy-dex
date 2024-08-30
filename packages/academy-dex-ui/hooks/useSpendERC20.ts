import { useCallback, useMemo } from "react";
import useRawCallsInfo from "./useRawCallsInfo";
import useSWR from "swr";
import { erc20Abi } from "viem";
import { useAccount, useWriteContract } from "wagmi";
import { TokenData } from "~~/components/Swap/types";
import { formatAmount } from "~~/utils/formatAmount";

export const useSpendERC20 = ({ token }: { token?: TokenData }) => {
  const { address } = useAccount();
  const { client } = useRawCallsInfo();
  const { writeContractAsync } = useWriteContract();

  const { data: spendAllowance } = useSWR(
    token && address ? { spender: token.pairAddr, owner: address, token: token.tradeTokenAddr } : null,
    ({ spender, owner, token }) =>
      client?.readContract({
        abi: erc20Abi,
        address: token,
        functionName: "allowance",
        args: [owner, spender],
      }),
  );

  const checkApproval = useCallback(
    async (amount: bigint) => {
      if (!token || spendAllowance == undefined) {
        throw new Error("Missing necessary data for token approval");
      }

      if (spendAllowance < amount) {
        await writeContractAsync({
          abi: erc20Abi,
          address: token.tradeTokenAddr,
          functionName: "approve",
          args: [token.pairAddr, amount],
        });
      }
    },
    [spendAllowance, token],
  );

  const tokenBalance = useMemo(
    () =>
      formatAmount({
        input: token?.balance || "0",
        decimals: token?.decimals,
        addCommas: true,
      }),
    [token],
  );

  return { tokenBalanceDisplay: tokenBalance, tokenBalance: tokenBalance.replace(/,/g, ""), checkApproval };
};

export const useSpenderERC20 = <TokenPayment extends { token: string; amount: bigint }>() => {
  const { address } = useAccount();
  const { client } = useRawCallsInfo();
  const { writeContractAsync } = useWriteContract();

  const checkApproval = useCallback(
    async ({ payment: { amount, token }, spender }: { payment: TokenPayment; spender: string }) => {
      if (!token || !address || !client) {
        throw new Error("Missing necessary data for token approval");
      }

      const spendAllowance = await client.readContract({
        abi: erc20Abi,
        address: token,
        functionName: "allowance",
        args: [address, spender],
      });

      if (spendAllowance < amount) {
        await writeContractAsync({
          abi: erc20Abi,
          address: token,
          functionName: "approve",
          args: [spender, amount],
        });
      }
    },
    [client, address],
  );

  return { checkApproval };
};

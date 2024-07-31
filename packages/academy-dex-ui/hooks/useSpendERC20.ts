import { useCallback, useMemo } from "react";
import useSWR from "swr";
import { erc20Abi } from "viem";
import { useAccount, usePublicClient, useWriteContract } from "wagmi";
import { TokenData } from "~~/components/Swap/types";
import { formatAmount } from "~~/utils/formatAmount";

export const useSpendERC20 = ({ token }: { token?: TokenData }) => {
  const { address } = useAccount();
  const client = usePublicClient();
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

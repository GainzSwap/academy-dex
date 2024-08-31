import useSWR from "swr";
import { erc20Abi } from "viem";
import { useSwapableTokens } from "~~/components/Swap/hooks";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import useRawCallsInfo from "~~/hooks/useRawCallsInfo";

export const useNewTokenInfo = ({ userAddress, token }: { userAddress?: string; token: string }) => {
  const { fetchTokenData } = useSwapableTokens({ address: userAddress });
  const { client } = useRawCallsInfo();

  const {
    data,
    isLoading: tokenInfoLoading,
    error: newTokenInfoErr,
  } = useSWR(
    token && client ? { key: "NewtradeToken", newTradeAddress: token, userAddress, client } : null,
    ({ newTradeAddress, client }) =>
      Promise.all([
        fetchTokenData(newTradeAddress),
        client.readContract({ abi: erc20Abi, address: token, functionName: "totalSupply" }),
      ]),
  );

  return { newTokenInfo: data?.[0], totalSupply: data?.[1], tokenInfoLoading, newTokenInfoErr };
};

export const useGovernanceCurrentEpoch = () =>
  useScaffoldReadContract({ contractName: "Governance", functionName: "currentEpoch" });

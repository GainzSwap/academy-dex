import useSWR from "swr";
import { useAccount } from "wagmi";
import useRawCallsInfo from "~~/hooks/useRawCallsInfo";
import { RefIdData } from "~~/utils";

export const useReferralInfo = () => {
  const { address } = useAccount();
  const { router, client } = useRawCallsInfo();

  const { data, mutate } = useSWR(
    address && client && router ? { key: "refdata-getAffiliateDetails", address, client, router } : null,
    ({ address, client, router }) =>
      Promise.all([
        client
          .readContract({ abi: router.abi, address: router.address, functionName: "getUserId", args: [address] })
          .then(id => new RefIdData(address, +id.toString())),
      ]),
  );

  return { refIdData: data?.at(0), refresh: () => mutate() };
};

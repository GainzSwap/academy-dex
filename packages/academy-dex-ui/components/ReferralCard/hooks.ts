import { useMemo } from "react";
import { useAccount } from "wagmi";
import { useGetUser } from "~~/hooks";
import { RefIdData } from "~~/utils";

export const useReferralInfo = () => {
  const { address } = useAccount();

  const { data, mutate } = useGetUser(address);
  const refIdData = useMemo(
    () => (!data || !address ? undefined : new RefIdData(address, data.user.idInContract || 0)),
    [data, address],
  );

  return {
    user: data?.user,
    botStart: data?.botStart,
    refIdData,
    refresh: () => mutate(),
  };
};

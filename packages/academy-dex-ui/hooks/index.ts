import { useTargetNetwork } from "./scaffold-eth";
import useSWR from "swr";
import { IUser } from "~~/drizzle/schema/types";
import axiosProvider from "~~/services/axiosProvider";

type Data = { user: IUser; botStart: string };

export const useGetUser = (address?: string) => {
  const { targetNetwork } = useTargetNetwork();

  return useSWR<Data>(address && targetNetwork ? `users/${address}?chainId=${targetNetwork.id}` : null, {
    fetcher: url => axiosProvider.get<Data>(url).then(res => res.data),
  });
};

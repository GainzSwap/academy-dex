import { WrappedEGLDSC } from "./WrappedEGLDSC";
import { Address } from "@multiversx/sdk-core/out";
import { wrapEgldContractAddress } from "src/config";
import apiProvider from "src/providers/apiProvider";
import { useAppSelector } from "src/store/hooks";
import { networkConfigSelector } from "src/store/slices/dappSlice/selectors";
import { accountSelector } from "src/store/slices/userSlice";
import { getShardOfAddress } from "src/utils/account/getShardOfAddress";
import useSwr from "swr";

const getWrappedEgldTokenId = () =>
  new WrappedEGLDSC(wrapEgldContractAddress[0], "", apiProvider).getWrappedEgldTokenId();

export const useWEGLD = () => {
  const { address } = useAppSelector(accountSelector);
  const networkConfig = useAppSelector(networkConfigSelector);

  const { data: wegldID } = useSwr("wegldIDrequest", () => getWrappedEgldTokenId());

  const { data: wrappedEGLDSC } = useSwr(
    address && networkConfig?.ChainID ? { key: `useWEGLD-${address}`, address, chainID: networkConfig.ChainID } : null,
    ({ address, chainID }) => {
      const addressShard = getShardOfAddress(new Address(address).pubkey());

      return new WrappedEGLDSC(wrapEgldContractAddress[addressShard], chainID, apiProvider);
    },
  );

  return { wrappedEGLDSC, wegldID };
};

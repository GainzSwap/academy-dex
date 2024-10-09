import { useEffect, useState } from "react";
import ElementWrapper from "./ElementWrapper";
import LoadingState from "./LoadingState";
import { useSwapableTokens } from "./Swap/hooks";
import { AxiosError } from "axios";
import useSWR from "swr";
import { useAccount } from "wagmi";
import { swrFetcher } from "~~/hooks";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";
import { useComputeTimeleft } from "~~/hooks/useComputeTimeleft";
import axiosProvider from "~~/services/axiosProvider";
import { formatAmount } from "~~/utils/formatAmount";

interface IFaucetData {
  active: boolean;
  claimable: string;
  nextClaimTimestamp: number;
}

export default function FaucetClaim() {
  const { targetNetwork } = useTargetNetwork();
  const { tokens } = useSwapableTokens({});
  const { address: userAddress } = useAccount();

  const url = userAddress ? `faucet/${userAddress}?chainId=${targetNetwork.id}` : null;

  const { data, error, mutate } = useSWR<IFaucetData>(url, { fetcher: url => swrFetcher<IFaucetData>(url) });

  const [withdrawFaucet, setWithdrawFaucet] = useState(false);
  const [withdrawFaucetError, setWithdrawFaucetError] = useState("");

  useEffect(() => {
    let controller: AbortController | undefined;

    if (withdrawFaucet && url) {
      controller = new AbortController();

      setWithdrawFaucetError("");

      axiosProvider
        .get<IFaucetData>(`${url}&claim=true`, {
          signal: controller.signal,
        })
        .then(({ data }) => {
          mutate(data);
        })
        .catch((error: AxiosError<{ message?: string }>) => {
          setWithdrawFaucetError(error.response?.data?.message || error.message);
        })
        .finally(() => {
          setWithdrawFaucet(false);
        });
    }

    return () => {
      controller?.abort();
    };
  }, [withdrawFaucet, mutate, url]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    if (withdrawFaucetError) {
      timer = setTimeout(() => {
        setWithdrawFaucetError("");
      }, 7500);
    }

    return () => {
      timer && clearTimeout(timer);
    };
  }, [withdrawFaucetError]);

  useEffect(() => {
    error && setWithdrawFaucetError(error?.response?.data?.message || error.message);
  }, [error]);

  const { blockSecsLeft, timeLeft } = useComputeTimeleft({ deadline: BigInt(data?.nextClaimTimestamp || 0) });

  if (!data?.active) {
    return null;
  }

  return (
    <ElementWrapper title="Faucet">
      <div className="legend-value-w">
        <div className="legend-value">
          <div
            className="legend-sub-value"
            style={{
              fontSize: "0.75rem",
              color: "red",
              wordBreak: "break-word",
            }}
          >
            {withdrawFaucetError}
          </div>
          {formatAmount({
            input: data.claimable,
          })}{" "}
          {tokens.map(token => "$" + token.identifier).join(", ")}
          {blockSecsLeft > 0 ? (
            <div className="legend-sub-value" style={{ fontSize: "0.75rem" }}>
              Claimable in {timeLeft}
            </div>
          ) : (
            <div className="legend-value">
              {withdrawFaucet ? (
                <LoadingState text={"Please wait"} />
              ) : (
                <button
                  className="btn btn-primary"
                  data-testid="claim-from-faucet-btn"
                  onClick={() => {
                    setWithdrawFaucet(true);
                  }}
                >
                  <i className="os-icon os-icon-log-out"></i>
                  <span>Claim From Faucet</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </ElementWrapper>
  );
}

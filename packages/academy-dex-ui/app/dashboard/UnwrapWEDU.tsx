import { useMemo } from "react";
import useSWR from "swr";
import { useAccount, useWriteContract } from "wagmi";
import { useSwapableTokens } from "~~/components/Swap/hooks";
import TokenIcon from "~~/components/TokenIcon";
import TxButton from "~~/components/TxButton";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";
import { prettyFormatAmount } from "~~/utils/formatAmount";

export default function UnwrapWEDU() {
  const { address } = useAccount();
  const { fetchTokenData, wEDUaddress } = useSwapableTokens({ address });

  const { data: weduData, mutate: refreshWEDUData } = useSWR(wEDUaddress || null, tokenAddress =>
    fetchTokenData(tokenAddress, true),
  );
  const { writeContractAsync } = useWriteContract();
  const { data: WEDU } = useDeployedContractInfo("WEDU");

  const balance = useMemo(() => {
    const balanceValue = weduData?.balance.toString();
    return prettyFormatAmount(balanceValue || "0");
  }, [weduData]);

  const onUnwrapWEDU = async () => {
    if (!WEDU) {
      throw new Error("WEDU not loaded");
    }
    if (!weduData) {
      throw new Error("weduData not loaded");
    }

    return writeContractAsync({
      abi: WEDU.abi,
      address: WEDU.address,
      functionName: "withdraw",
      args: [BigInt(weduData.balance)],
    });
  };

  if (weduData == undefined || weduData.balance == "0") {
    return null;
  }

  return (
    <div className="element-wrapper compact pt-4">
      <h6 className="element-header">Unwrap WEDU</h6>
      <div className="col-12">
        <div className="element-balances justify-content-between mobile-full-width">
          <div className="balance balance-v2" style={{ marginTop: "-35px" }}>
            <div className="balance-title">Your WEDU Balance</div>
            <div className="balance-value" style={{ fontSize: "1.5em" }}>
              <span className="d-xxl-none">
                <TokenIcon identifier="WEDU" />
                {balance}
              </span>
              <span className="d-none d-xxl-inline-block">
                <TokenIcon identifier="WEDU" />
                {balance}
              </span>
            </div>
          </div>
        </div>
        <div className="element-wrapper pb-4 mb-4 border-bottom">
          <div className="element-box-tp row">
            <TxButton
              icon={<i className="os-icon os-icon-refresh-ccw"></i>}
              btnName="Unwrap WEDU"
              onClick={() => onUnwrapWEDU()}
              onComplete={() => refreshWEDUData()}
              className="btn btn-grey"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

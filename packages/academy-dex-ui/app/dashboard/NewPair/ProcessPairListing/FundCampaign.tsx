import { Campaign } from "./types";
import { useFormik } from "formik";
import { parseEther } from "viem";
import { useAccount, useBalance, useWriteContract } from "wagmi";
import FormErrorMessage from "~~/components/FormErrorMessage";
import LoadingState from "~~/components/LoadingState";
import TokenIcon from "~~/components/TokenIcon";
import TxButton from "~~/components/TxButton";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";
import { useComputeTimeleft } from "~~/hooks/useComputeTimeleft";
import { prettyFormatAmount } from "~~/utils/formatAmount";

export function FundCampaign({ campaign, campaignId }: { campaign?: Campaign; campaignId?: bigint }) {
  const { timeLeft } = useComputeTimeleft({ deadline: campaign?.deadline || 0n });

  const { address } = useAccount();
  const { data: eduData } = useBalance({ address });

  if (!campaign || campaignId == undefined) {
    return <LoadingState text="Loading campaign" />;
  }
  const { fundsRaised, goal } = campaign;
  const fundingProgress = (+fundsRaised.toString() / +goal.toString()) * 100;

  return (
    <div className="element-box">
      <div className="row">
        <div className="col-sm-4">
          <span>Campaign Ends in </span>
          <div className="legend-sub-value" style={{ fontSize: "0.75rem" }}>
            {timeLeft}
          </div>
        </div>
        <div className="col-sm-4">
          <span>Funds Raised </span>
          <div className="legend-sub-value" style={{ fontSize: "0.75rem" }}>
            {eduData && <TokenIcon identifier={eduData.symbol} />} {prettyFormatAmount(fundsRaised.toString())}
          </div>
        </div>
        <div className="col-sm-4">
          <span>Funding Goal </span>
          <div className="legend-sub-value" style={{ fontSize: "0.75rem" }}>
            {eduData && <TokenIcon identifier={eduData.symbol} />} {prettyFormatAmount(goal.toString())}
          </div>
        </div>
      </div>
      <div className="form-desc" style={{ marginTop: "15px", fontSize: "2.3em" }}>
        Funding Progress
        <div className="progress">
          <div
            aria-valuemax={100}
            aria-valuemin={0}
            aria-valuenow={fundingProgress}
            className="progress-bar bg-success"
            role="progressbar"
            style={{ width: fundingProgress + "%", fontWeight: "bold" }}
          >
            {fundingProgress.toFixed(2)}%
          </div>
        </div>
      </div>
      <SendCampaignFunding campaignId={campaignId} />
    </div>
  );
}

function SendCampaignFunding({ campaignId }: { campaignId: bigint }) {
  const { address } = useAccount();
  const { data: eduData } = useBalance({ address });

  const { data: LaunchPair } = useDeployedContractInfo("LaunchPair");
  const { writeContractAsync } = useWriteContract();
  const { handleChange, values, errors, handleSubmit } = useFormik({
    initialValues: {
      amount: 0,
    },
    onSubmit: () => {
      console.log("Submited");
    },
  });

  const fundCampaign = async () => {
    if (!LaunchPair) {
      throw new Error("LaunchPair contract not loaded");
    }

    return await writeContractAsync({
      abi: LaunchPair.abi,
      address: LaunchPair.address,
      functionName: "contribute",
      args: [campaignId],
      value: parseEther(values.amount.toString()),
    });
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="form-group col-4 col-md-6 col-sm-12 mb-1">
          <label>{eduData && <TokenIcon identifier={eduData.symbol} />} Amount</label>
          <div className="input-group">
            <input
              type="number"
              className={`form-control ${errors.amount ? "is-invalid" : ""}`}
              id="amount"
              name="amount"
              onChange={handleChange}
              value={values.amount}
              placeholder="Enter amount of EDU you wish to raise"
            />

            <FormErrorMessage message={errors.amount} />
          </div>
        </div>

        <TxButton
          btnName="Fund Campaign"
          className="btn btn-grey"
          disabled={values.amount == 0}
          onClick={() => fundCampaign()}
        />
      </form>
    </>
  );
}

import { useState } from "react";
import { useFormik } from "formik";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { parseEther } from "viem";
import { useBlock, useWriteContract } from "wagmi";
import FormErrorMessage from "~~/components/FormErrorMessage";
import LoadingState from "~~/components/LoadingState";
import TxButton from "~~/components/TxButton";
import { useDeployedContractInfo, useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { useComputeTimeleft } from "~~/hooks/useComputeTimeleft";
import { TokenListing } from "~~/types/utils";
import { AbiFunctionReturnType, ContractAbi } from "~~/utils/scaffold-eth/contract";

export default function ProcessPairListing({ lisiting }: { lisiting: TokenListing }) {
  const { data: campaign } = useScaffoldReadContract({
    contractName: "LaunchPair",
    functionName: "getCampaignDetails",
    args: [lisiting.campaignId],
  });
  const { timeLeft, block } = useComputeTimeleft({ deadline: campaign?.deadline || 0n });

  if (!campaign || !block) {
    return <LoadingState text="Getting Campaign Details" />;
  }

  if (lisiting.campaignId == 0n) {
    return <ProgressPairListing />;
  } else if (campaign.goal == 0n) {
    return <StartCampaign campaignId={lisiting.campaignId} />;
  }

  const { deadline } = campaign;

  return (
    <div className="element-box">
      <div className="row">
        <div className="col-sm-6">
          <div className="os-progress-bar primary ">
            <div className="bar-labels">
              <div className="bar-label-left">
                <span>Campaign Ends in </span>

                <div className="legend-sub-value" style={{ fontSize: "0.75rem" }}>
                  {timeLeft}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export type LaunchPairAbiType = ContractAbi<"LaunchPair">;
export type Campaign = AbiFunctionReturnType<LaunchPairAbiType, "getCampaignDetails">;
function StartCampaign({ campaignId }: { campaignId: bigint }) {
  const { data: LaunchPair } = useDeployedContractInfo("LaunchPair");
  const { writeContractAsync } = useWriteContract();
  const { data: block } = useBlock();
  const [endDate, setEndDate] = useState<Date>();

  if (!block) {
    return <LoadingState text="Preparing StartCampaign" />;
  }

  const { handleChange, values, errors, handleSubmit, setFieldValue, setFieldError } = useFormik({
    initialValues: {
      goal: 0,
      duration: 0,
    },
    onSubmit: () => {
      console.log("Submited");
    },
  });

  const startCampaign = async () => {
    if (!LaunchPair) {
      throw new Error("LaunchPair contract not loaded");
    }
    return await writeContractAsync({
      abi: LaunchPair.abi,
      address: LaunchPair.address,
      functionName: "startCampaign",
      args: [parseEther(values.goal.toString()), BigInt(values.duration), campaignId],
    });
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="form-group col-4 col-md-6 col-sm-12 mb-1">
          <label>Campaign Goal</label>
          <div className="input-group">
            <input
              type="number"
              className={`form-control ${errors.goal ? "is-invalid" : ""}`}
              id="goal"
              name="goal"
              onChange={handleChange}
              value={values.goal}
              placeholder="Enter amount of EDU you wish to raise"
            />

            <FormErrorMessage message={errors.goal} />
          </div>
        </div>
        <div className="form-group col-4 col-md-6 col-sm-12 mb-1">
          <label>Campaign End Date</label>
          <div className="input-group">
            <DatePicker
              startDate={endDate}
              value={endDate && endDate.toLocaleDateString()}
              onChange={date => {
                if (date) {
                  const timestamp = Math.floor(date.getTime() / 1000);
                  const duration = timestamp - +block.timestamp.toString();

                  if (duration > 0) {
                    setEndDate(date);
                    setFieldValue("duration", duration);
                  } else {
                    setFieldError("duration", " Invalid day and time selected");
                  }
                }
              }}
              name="duration"
              className={`btn form-control ${errors.duration ? "is-invalid" : ""}`}
            />

            <FormErrorMessage message={errors.duration} />
          </div>
        </div>
        <TxButton
          btnName="Start Campaign"
          className="btn btn-warning"
          disabled={values.goal == 0 || values.duration == 0}
          onClick={async () => startCampaign()}
        />
      </form>
    </>
  );
}

function ProgressPairListing() {
  const { data: Governance } = useDeployedContractInfo("Governance");
  const { writeContractAsync } = useWriteContract();

  const progressListing = async () => {
    if (!Governance) {
      throw new Error("Governance contract not loaded");
    }

    return await writeContractAsync({
      abi: Governance.abi,
      address: Governance.address,
      functionName: "progressNewPairListing",
    });
  };

  return <TxButton onClick={() => progressListing()} btnName="Progress Listing Process" className="btn btn-warning" />;
}

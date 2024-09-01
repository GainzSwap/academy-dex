import { useState } from "react";
import BigNumber from "bignumber.js";
import { useFormik } from "formik";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { parseEther } from "viem";
import { useWriteContract } from "wagmi";
import FormErrorMessage from "~~/components/FormErrorMessage";
import TxButton from "~~/components/TxButton";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";

export default function StartCampaign({ campaignId }: { campaignId: bigint }) {
  const { data: LaunchPair } = useDeployedContractInfo("LaunchPair");
  const { writeContractAsync } = useWriteContract();
  const [endDate, setEndDate] = useState<Date>();

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
      args: [parseEther(BigNumber(values.goal).toFixed()), BigInt(values.duration), campaignId],
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
              value={endDate && endDate.toLocaleDateString()}
              onChange={date => {
                if (date) {
                  const duration = Math.floor((date.getTime() - Date.now()) / 1000);

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

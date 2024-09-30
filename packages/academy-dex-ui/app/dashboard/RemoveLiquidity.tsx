import { useCallback, useMemo } from "react";
import BigNumber from "bignumber.js";
import { useFormik } from "formik";
import Select from "react-select";
import { parseEther } from "viem";
import { useWriteContract } from "wagmi";
import FormErrorMessage from "~~/components/FormErrorMessage";
import { useModalToShow } from "~~/components/Modals";
import TxButton from "~~/components/TxButton";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";
import useLpTokens from "~~/hooks/useLpTokens";
import { formatAmount, prettyFormatAmount } from "~~/utils/formatAmount";

function RemoveLiquidityModal() {
  const { closeModal } = useModalToShow();
  const { lpBalances } = useLpTokens();

  const lpTokens = useMemo(
    () =>
      lpBalances?.map(({ amount, nonce, identifier }) => ({
        value: {
          nonce,
          amount: formatAmount({
            input: amount,
            addCommas: true,
          }),
        },
        label: `${identifier} ${prettyFormatAmount(amount.toString())}`,
      })),

    [lpBalances],
  );

  const { data: Router } = useDeployedContractInfo("Router");

  const {
    handleSubmit,
    resetForm,
    values,
    setFieldValue,
    errors: inputErr,
    handleChange,
  } = useFormik({
    initialValues: {
      amount: "",
      selectedToken: undefined as { nonce: bigint; amount: string } | undefined,
    },
    onSubmit: ({ amount }) => {
      console.log({ amount });
    },
  });

  const { writeContractAsync } = useWriteContract();

  const onRemoveLiq = async () => {
    if (!Router) {
      throw new Error("Router contract not loaded");
    }

    if (!values.selectedToken || !values.amount) {
      throw new Error("Values not set");
    }

    return writeContractAsync({
      abi: Router.abi,
      address: Router.address,
      functionName: "removeLiquidity",
      args: [values.selectedToken.nonce, parseEther(BigNumber(values.amount.replace(/,/g, "")).toFixed())],
    });
  };
  const onMax = useCallback(() => {
    setFieldValue("amount", values.selectedToken?.amount);
  }, [values]);

  return (
    <>
      <button aria-label="Close" className="close" onClick={closeModal} type="button">
        <span className="close-label">Cancel</span>
        <span className="os-icon os-icon-close"></span>
      </button>
      <div className="onboarding-side-by-side">
        <div className="onboarding-media">
          <img alt="" src="img/bigicon5.png" width="200px" />
        </div>
        <div className="onboarding-content with-gradient">
          <h4 className="onboarding-title">Remove Liquidity</h4>
          <div className="onboarding-text">Set the token and amount you wish to remove liquidity from</div>
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-sm-6">
                <Select
                  onChange={token => {
                    resetForm();
                    setFieldValue("selectedToken", token?.value);
                  }}
                  styles={{
                    option: styles => {
                      return { ...styles, color: "black" };
                    },
                  }}
                  options={lpTokens}
                />
              </div>
              <div className="form-group col-12 mb-1">
                <div className="input-group">
                  <input
                    type="text"
                    className={`form-control ${inputErr.amount ? "is-invalid" : ""}`}
                    id="amount"
                    name="amount"
                    onChange={handleChange}
                    value={values.amount}
                    placeholder={!values.selectedToken ? "Select Token to remove liquidity" : "Enter Amount"}
                    disabled={!values.selectedToken}
                    step={"any"}
                    min={0}
                  />
                  {/* Max Button */}
                  {!(values.selectedToken?.amount === values.amount) && (
                    <div onClick={onMax} className="input-group-text max btn" style={{ height: "100%" }}>
                      Max
                    </div>
                  )}
                  <FormErrorMessage message={inputErr.amount} />
                </div>

                {!inputErr.amount && values.selectedToken && (
                  <small className="form-text">
                    Available: <span>{values.selectedToken.amount}</span>
                  </small>
                )}
              </div>
            </div>
            <TxButton
              onComplete={closeModal}
              btnName="Remove Liquidity"
              className="btn btn-grey"
              onClick={async () => onRemoveLiq()}
            />
          </form>
        </div>
      </div>
    </>
  );
}

export default function RemoveLiquidityButton() {
  const { lpBalances } = useLpTokens();
  const { openModal } = useModalToShow();

  if (!lpBalances?.length) {
    return null;
  }

  return (
    <button
      className="btn btn-grey"
      onClick={() => {
        openModal(<RemoveLiquidityModal />);
      }}
    >
      <i className="os-icon os-icon-log-out"></i>
      <span>Remove Liquidity</span>
    </button>
  );
}

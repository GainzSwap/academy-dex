import { useMemo } from "react";
import { useFormik } from "formik";
import Select from "react-select";
import { useWriteContract } from "wagmi";
import { useModalToShow } from "~~/components/Modals";
import TxButton from "~~/components/TxButton";
import { useDeployedContractInfo, useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import useGTokens from "~~/hooks/useGTokens";
import { formatAmount, prettyFormatAmount } from "~~/utils/formatAmount";
import nonceToRandString from "~~/utils/nonceToRandom";

function ExitGovernanceModal() {
  const { closeModal } = useModalToShow();

  const { gTokens, refetch } = useGTokens();
  const { data: GTokens } = useDeployedContractInfo("GTokens");
  const { data: gtokenSymbol } = useScaffoldReadContract({ contractName: "GTokens", functionName: "symbol" });

  const gTokenOptions = useMemo(
    () =>
      gTokens?.map(({ nonce, attributes: { lpAmount, epochsLocked } }) => ({
        value: {
          nonce,
          amount: formatAmount({
            input: lpAmount,
            addCommas: true,
          }),
        },
        label: `${prettyFormatAmount(lpAmount.toString())} ${gtokenSymbol + "-" + nonceToRandString(nonce, GTokens?.address || "")} ${epochsLocked}`,
      })),

    [gTokens, gtokenSymbol, GTokens],
  );

  const { data: Governance } = useDeployedContractInfo("Governance");

  const { handleSubmit, resetForm, values, setFieldValue } = useFormik({
    initialValues: {
      selectedToken: undefined as { nonce: bigint; amount: string } | undefined,
    },
    onSubmit: ({ selectedToken }) => {
      console.log({ selectedToken });
    },
  });

  const { writeContractAsync } = useWriteContract();

  const onUnStake = async () => {
    if (!Governance) {
      throw new Error("Governance contract not loaded");
    }

    if (!values.selectedToken) {
      throw new Error("Values not set");
    }

    return writeContractAsync({
      abi: Governance.abi,
      address: Governance.address,
      functionName: "exitGovernance",
      args: [values.selectedToken.nonce],
    });
  };

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
          <h4 className="onboarding-title">Exit Governance</h4>
          <div className="onboarding-text">Set the token you wish to unStake from</div>
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-sm-12">
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
                  options={gTokenOptions}
                />
              </div>
            </div>
            <TxButton
              onComplete={async () => {
                closeModal();
                refetch();
              }}
              btnName="UnStake"
              className="btn btn-grey"
              onClick={async () => onUnStake()}
            />
          </form>
        </div>
      </div>
    </>
  );
}

export default function ExitGovernanceButton() {
  const { gTokens } = useGTokens();
  const { openModal } = useModalToShow();

  if (!gTokens?.length) {
    return null;
  }

  return (
    <button
      className="btn btn-grey"
      onClick={() => {
        openModal(<ExitGovernanceModal />);
      }}
    >
      <i className="os-icon os-icon-log-out"></i>
      <span>Un Stake</span>
    </button>
  );
}

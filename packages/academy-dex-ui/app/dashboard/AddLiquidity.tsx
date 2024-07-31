"use client";

import { useCallback, useMemo, useState } from "react";
import BigNumber from "bignumber.js";
import { useFormik } from "formik";
import useSWR from "swr";
import { erc20Abi, parseUnits } from "viem";
import { useAccount, usePublicClient, useReadContract, useWriteContract } from "wagmi";
import FormErrorMessage from "~~/components/FormErrorMessage";
import { useModalToShow } from "~~/components/Modals";
import TokensSelect from "~~/components/Swap/TokensSelect";
import { useSwapableTokens } from "~~/components/Swap/hooks";
import { TokenData } from "~~/components/Swap/types";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { useSpendERC20 } from "~~/hooks/useSpendERC20";

export const AddLiquidityModal = ({ selectedToken_ }: { selectedToken_?: TokenData }) => {
  const { closeModal } = useModalToShow();
  const { address } = useAccount();
  const { tokens, updateSwapableTokens } = useSwapableTokens({ address });
  const [selectedToken, setSelectedToken] = useState<TokenData | undefined>(selectedToken_);

  const client = usePublicClient();
  const { writeContractAsync: writeRouter } = useScaffoldWriteContract("Router");
  const { data: spendAllowance } = useSWR(
    selectedToken && address
      ? { spender: selectedToken.pairAddr, owner: address, token: selectedToken.tradeTokenAddr }
      : null,
    ({ spender, owner, token }) =>
      client?.readContract({
        abi: erc20Abi,
        address: token,
        functionName: "allowance",
        args: [owner, spender],
      }),
  );

  const { checkApproval, tokenBalance, tokenBalanceDisplay } = useSpendERC20({ token: selectedToken });

  const { handleSubmit, handleChange, values, setFieldValue, errors } = useFormik({
    initialValues: {
      sendAmt: "",
    },
    onSubmit: async ({ sendAmt }, { setFieldError, resetForm }) => {
      try {
        if (!selectedToken || spendAllowance == undefined) {
          throw new Error("Missing necessary data for the swap");
        }

        const amtToSpend = parseUnits(BigNumber(sendAmt).toFixed(selectedToken.decimals), selectedToken.decimals);

        await checkApproval(amtToSpend);

        await writeRouter({
          functionName: "addLiquidity",
          args: [{ token: selectedToken.tradeTokenAddr, amount: amtToSpend }],
        });

        updateSwapableTokens();
        resetForm();
        closeModal();
      } catch (error: any) {
        setFieldError("sendAmt", error.toString());
      }
    },
  });

  const sendAmountHaserror = !!errors.sendAmt;

  const onMax = useCallback(() => {
    setFieldValue("sendAmt", tokenBalance);
  }, [tokenBalance]);
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
          <h4 className="onboarding-title">Add Liquidity, Earn Rewards and Trading Fees</h4>
          <div className="onboarding-text">Set the token and amount you wish to add liquidity with</div>
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-sm-6">
                <TokensSelect
                  tokens={tokens}
                  selected={selectedToken}
                  setSelected={token => setSelectedToken(token)}
                  title="To"
                />
              </div>
              <div className="form-group col-12 mb-1">
                <label>Send</label>
                <div className="input-group">
                  <input
                    data-testid="swap-tokens-sendAmt-input"
                    type="number"
                    className={`form-control ${sendAmountHaserror ? "is-invalid" : ""}`}
                    id="sendAmt"
                    name="sendAmt"
                    onChange={handleChange}
                    value={values.sendAmt}
                    placeholder={!selectedToken ? "Select Token to add liquidity" : "Enter Amount"}
                    disabled={!selectedToken}
                    step={"any"}
                    min={0}
                  />
                  {/* Max Button */}
                  {!(tokenBalance === values.sendAmt) && (
                    <div onClick={onMax} className="input-group-text max btn" style={{ height: "100%" }}>
                      Max
                    </div>
                  )}
                  <FormErrorMessage message={errors.sendAmt} />
                </div>

                {!sendAmountHaserror && selectedToken && (
                  <small className="form-text">
                    Available: <span>{tokenBalanceDisplay}</span>
                  </small>
                )}
              </div>
              {!!values.sendAmt && (
                <button className="btn btn-primary text-white">
                  <i className="os-icon os-icon-log-in"></i>
                  <span>Add Liquidity</span>
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default function AddLiquidity({ selectedToken_ }: { selectedToken_?: TokenData }) {
  const { openModal } = useModalToShow();

  return (
    <a
      className={`btn btn-${!!selectedToken_ ? "primary" : "success"} text-white`}
      onClick={() => {
        openModal(<AddLiquidityModal selectedToken_={selectedToken_} />);
      }}
    >
      <i className="os-icon os-icon-log-in"></i>
      <span>Add Liquidity</span>
    </a>
  );
}

import { useCallback, useEffect, useMemo, useState } from "react";
import LoadingState from "../LoadingState";
import TokenIcon from "../TokenIcon";
import InputIcon from "./InputIcon";
import SwapButton from "./SwapButton";
import TokensSelect from "./TokensSelect";
import { useSlippageAdjuster, useSwapTokensForm, useSwapableTokens } from "./hooks";
import { TokenData } from "./types";
import { useAccount } from "wagmi";
import { formatAmount } from "~~/utils/formatAmount";

// import { useSlippageAdjuster } from '../../hooks';

const tokensSwapWidth = "41.83333333%";

export function SwapTokensHead() {
  return <>Quick Swap</>;
}

export function SwapTokensBody() {
  const { address } = useAccount();

  const [fromToken, setFromToken] = useState<TokenData>();
  const [toToken, setToToken] = useState<TokenData>();
  const { applySlippage, slippageSlider } = useSlippageAdjuster();

  const { tokens, isTokensLoaded, updateSwapableTokens } = useSwapableTokens({
    address,
  });

  // SwitchTokens
  const switchTokens = useCallback(() => {
    setFromToken(fromToken => {
      setToToken(fromToken);
      return toToken;
    });
  }, [toToken]);

  // Reset form on tokens' id change
  useEffect(() => {
    resetForm();
  }, [toToken?.identifier, fromToken?.identifier]);

  const onSwapComplete = () => {
    updateSwapableTokens();
    resetForm();
  };

  const sendBalance = useMemo(
    () =>
      formatAmount({
        input: fromToken?.balance || "0",
        decimals: fromToken?.decimals,
      }),
    [fromToken],
  );

  const { handleChange, handleSubmit, onMax, values, errors, isCalculatingReceiveAmt, sendAmountHaserror, resetForm } =
    useSwapTokensForm({
      fromToken,
      toToken,
      sendBalance,
      applySlippage,
    });

  return !isTokensLoaded && !(toToken || fromToken) ? (
    <LoadingState text="Getting tokens" />
  ) : (
    <form data-testid="swap-tokens-form" onSubmit={handleSubmit}>
      <div className="d-flex justify-content-between">
        <div style={{ width: tokensSwapWidth }}>
          <TokensSelect selected={fromToken} title="From" setSelected={token => setFromToken(token)} tokens={tokens} />
        </div>
        <div className="d-flex">
          <i
            data-testid="swap-tokens-switch-btn"
            onClick={switchTokens}
            className="fa fa-exchange"
            style={{
              margin: "auto",
              fontSize: "1.95em",
              cursor: "pointer",
            }}
          ></i>
        </div>
        <div style={{ width: tokensSwapWidth }}>
          <TokensSelect selected={toToken} title="To" setSelected={token => setToToken(token)} tokens={tokens} />
        </div>
      </div>
      <div className="row mb-3">
        {slippageSlider}
        <div className="form-group col-12 mb-1">
          <label>Send</label>
          <div className="input-group">
            {fromToken && <InputIcon position="prepend" src={fromToken.iconSrc} identifier={fromToken.identifier} />}{" "}
            <input
              data-testid="swap-tokens-sendAmt-input"
              type="number"
              className={`form-control ${sendAmountHaserror ? "is-invalid" : ""}`}
              id="sendAmt"
              name="sendAmt"
              onChange={handleChange}
              value={values.sendAmt}
              placeholder={!fromToken ? "Select Token to Swap from" : "Enter Amount"}
              disabled={!fromToken}
              step={"any"}
              min={0}
            />
            {/* Max Button */}
            {!(sendBalance === values.sendAmt) && (
              <div className="input-group-prepend" style={{ overflow: "hidden" }}>
                <div onClick={onMax} className="input-group-text btn" style={{ height: "100%" }}>
                  Max
                </div>
              </div>
            )}
            <FormErrorMessage message={errors.sendAmt} />
            <FormErrorMessage message={errors.receiveAmt} />
          </div>

          {!sendAmountHaserror && fromToken && (
            <small className="form-text">
              Available: <span data-testid="swap-tokens-max-sendAmt">{sendBalance}</span>
            </small>
          )}
        </div>
        {toToken && !!+values.sendAmt && (
          <div className="form-group col-12">
            <label>Receive</label>
            <div className="input-group">
              <InputIcon position="prepend" src={toToken.iconSrc} identifier={toToken.identifier} />{" "}
              <span className="form-control" data-testid="swap-tokens-receiveAmt">
                {isCalculatingReceiveAmt ? <LoadingState text="Calculating" /> : values.receiveAmt}
              </span>
            </div>

            {+values.receiveAmt > 0 && (
              <small className="form-text">
                <TokenIcon src={fromToken!.iconSrc} identifier={fromToken!.identifier} /> 1{"  "}≃{"  "}
                {+values.receiveAmt / +values.sendAmt}{" "}
                <TokenIcon src={toToken.iconSrc} identifier={toToken.identifier} />
              </small>
            )}
          </div>
        )}
      </div>
      <div className="d-grid gap-2">
        <SwapButton onSwapComplete={onSwapComplete} />
      </div>
    </form>
  );
}

function FormErrorMessage({ message }: { message?: string }) {
  return !message ? null : <div className="invalid-feedback">{message}</div>;
}

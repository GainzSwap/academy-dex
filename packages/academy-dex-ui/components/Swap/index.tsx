import { useCallback, useEffect, useState } from "react";
import FormErrorMessage from "../FormErrorMessage";
import LoadingState from "../LoadingState";
import TokenIcon from "../TokenIcon";
import InputIcon from "./InputIcon";
import SwapButton from "./SwapButton";
import TokensSelect from "./TokensSelect";
import { useSlippageAdjuster, useSwapTokensForm, useSwapableTokens } from "./hooks";
import { TokenData } from "./types";
import { useAccount } from "wagmi";
import { useSpendERC20 } from "~~/hooks/useSpendERC20";

const tokensSwapWidth = "41.83333333%";

export function SwapTokensBody() {
  const { address } = useAccount();

  const [fromToken, setFromToken] = useState<TokenData>();
  const [toToken, setToToken] = useState<TokenData>();
  const { slippage, slippageSlider } = useSlippageAdjuster();

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

  const { tokenBalance, tokenBalanceDisplay } = useSpendERC20({ token: fromToken });

  const { handleChange, handleSubmit, onMax, values, errors, isCalculatingReceiveAmt, sendAmountHaserror, resetForm } =
    useSwapTokensForm({
      fromToken,
      toToken,
      sendBalance: tokenBalance,
      slippage,
    });

  // Keep selected tokens fresh
  useEffect(() => {
    const tryUpdate = ({ from, to }: { from?: TokenData; to?: TokenData }) => {
      let _from = from;
      let _to = to;
      let fromFound = !Boolean(_from);
      let toFound = !Boolean(_to);

      tokens.some(token => {
        if (!fromFound && _from) {
          fromFound = token.identifier === _from.identifier;
          fromFound && (_from = Object.assign({}, token));
        } else if (!toFound && _to) {
          toFound = token.identifier === _to.identifier;
          toFound && (_to = Object.assign({}, token));
        }

        return fromFound && toFound;
      });

      return { _from, _to };
    };

    setToToken(to => {
      setFromToken(from => {
        const { _from, _to } = tryUpdate({ from, to });
        to = _to;

        return _from;
      });

      return to;
    });
  }, [tokens]);

  // Filter out `fromToken` and `toToken` from the fetched tokens
  const filteredTokens = tokens?.filter(
    token => token.identifier !== fromToken?.identifier && token.identifier !== toToken?.identifier,
  );

  return !isTokensLoaded && !(toToken || fromToken) ? (
    <LoadingState text="Getting tokens" />
  ) : (
    <form data-testid="swap-tokens-form" onSubmit={handleSubmit}>
      <div className="d-flex justify-content-between">
        <div style={{ width: tokensSwapWidth }}>
          <TokensSelect
            selected={fromToken}
            title="From"
            setSelected={token => setFromToken(token)}
            tokens={filteredTokens}
          />
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
          <TokensSelect
            selected={toToken}
            title="To"
            setSelected={token => setToToken(token)}
            tokens={filteredTokens}
          />
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
            {!(tokenBalance === values.sendAmt) && (
              <div onClick={onMax} className="input-group-text max btn" style={{ height: "100%" }}>
                Max
              </div>
            )}
            <FormErrorMessage message={errors.sendAmt} />
            <FormErrorMessage message={errors.receiveAmt} />
          </div>

          {!sendAmountHaserror && fromToken && (
            <small className="form-text">
              Available: <span data-testid="swap-tokens-max-sendAmt">{tokenBalanceDisplay}</span>
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
              <>
                <small className="form-text">
                  <TokenIcon src={fromToken!.iconSrc} identifier={fromToken!.identifier} /> 1{"  "}≃{"  "}
                  {+values.receiveAmt / +values.sendAmt}{" "}
                  <TokenIcon src={toToken.iconSrc} identifier={toToken.identifier} />
                </small>{" "}
                @&nbsp;
                <span className={`form-text ${+values.feePercent > 5 ? "text-danger" : "text-warning"}`}>
                  {values.feePercent}%
                </span>
                &nbsp;fee
              </>
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

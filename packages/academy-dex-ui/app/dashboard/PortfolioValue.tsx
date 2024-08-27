"use client";

import { useMemo, useState } from "react";
import AddLiquidity from "./AddLiquidity";
import BigNumber from "bignumber.js";
import { useAccount } from "wagmi";
import { useSwapableTokens } from "~~/components/Swap/hooks";
import { useDeployedContractInfo, useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { useOnPathChange } from "~~/hooks/useContentPanel";
import useLpTokens from "~~/hooks/useLpTokens";
import { truncateFromInside } from "~~/utils";
import { prettyFormatAmount } from "~~/utils/formatAmount";
import nonceToRandString from "~~/utils/nonceToRandom";

const usePortfolioViewToggler = () => {
  const [opened, setOpened] = useState(false);

  useOnPathChange(() => setOpened(false));

  return {
    opened,
    viewToggler: () => {
      // Toggle opened state
      setOpened(!opened);
    },
    close: () => {
      setOpened(false);
    },
  };
};

export default function PortfolioValue() {
  const { opened, viewToggler, close } = usePortfolioViewToggler();

  const { address } = useAccount();
  const { tokens } = useSwapableTokens({ address });

  const { baseToken } = useMemo(() => {
    let baseToken = tokens.at(0);

    !Boolean(baseToken?.identifier.includes("ADEX")) &&
      tokens.some(token => {
        if (token.identifier.includes("ADEX")) {
          baseToken = token;
          return true;
        }
      });

    return { baseToken };
  }, [tokens]);

  const { lpBalances } = useLpTokens();
  const { data: lpSymbol } = useScaffoldReadContract({ contractName: "LpToken", functionName: "symbol" });

  return !baseToken ? null : (
    <div className={`fancy-selector-w ${opened ? "opened" : ""}`}>
      <div className="fancy-selector-current">
        <div className="fs-img">
          <img alt="" src="img/card4.png" />
        </div>
        <div className="fs-main-info">
          <div className="fs-name">
            <span>Base Portfolio</span>
            <strong>{baseToken.identifier}</strong>
          </div>
          <div className="fs-sub">
            <span>Balance:</span>
            <strong>
              {prettyFormatAmount(baseToken.balance.toString(), {
                decimals: baseToken.decimals,
                length: 12,
                minLength: 16,
              })}
            </strong>
          </div>
        </div>
        <div onClick={viewToggler} className="fs-selector-trigger">
          <i className="os-icon os-icon-arrow-down4"></i>
        </div>
      </div>
      <div className="fancy-selector-options">
        {tokens.map(token => {
          if (BigNumber(token.balance).isZero()) {
            return;
          }
          return (
            <div key={token.pairAddr} className="fancy-selector-option" style={{ minWidth: "350px" }}>
              <div className="fs-main-info">
                <div className="fs-name">
                  <span>{token.identifier} Portfolio</span>
                  {/* <strong>{lkXht.collection}</strong> */}
                </div>
                <div className="fs-sub">
                  <span>Balance:</span>
                  <strong>
                    {prettyFormatAmount(token.balance.toString(), {
                      length: 10,
                      decimals: token.decimals,
                      minLength: 14,
                    })}
                  </strong>
                </div>
              </div>
              {token.balance.length > 3 && (
                <div onClick={close}>
                  <AddLiquidity selectedToken_={token} />
                </div>
              )}
            </div>
          );
        })}

        {!!lpBalances?.length && <>LP Tokens</>}
        {lpBalances?.map(({ nonce, amount, attributes }, index) => {
          const identifier = lpSymbol + "-" + nonceToRandString(nonce, attributes.pair);

          return (
            <div key={identifier} className="fancy-selector-option">
              <div className="fs-main-info">
                <div className="fs-name">
                  <span>Pool: {truncateFromInside(attributes.pair,10)}</span>
                  <strong>{identifier}</strong>
                </div>
                <div className="fs-sub">
                  <span>Amount:</span>
                  <strong>{prettyFormatAmount(amount.toString())}</strong>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

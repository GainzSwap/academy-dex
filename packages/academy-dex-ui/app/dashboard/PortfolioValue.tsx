"use client";

import { useMemo, useState } from "react";
import AddLiquidity from "./AddLiquidity";
import BigNumber from "bignumber.js";
import { useAccount } from "wagmi";
import { useSwapableTokens } from "~~/components/Swap/hooks";
import { useOnPathChange } from "~~/hooks/useContentPanel";
import { prettyFormatAmount } from "~~/utils/formatAmount";

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

    !Boolean(baseToken?.identifier.includes("BASE")) &&
      tokens.some(token => {
        if (token.identifier.includes("BASE")) {
          baseToken = token;
          return true;
        }
      });

    return { baseToken };
  }, [tokens]);

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
              {/* <button onClick={() => onUnlockLockedXHT()} className="btn btn-primary" style={{ fontSize: "0.75em" }}>
                  Unlock
                </button> */}
            </div>
          );
        })}
        {/* {lkXht && (
        
        )}

        {xProjectsToken && <>Properties</>}
        {xProjectsToken?.map(token => (
          <div key={token.identifier} className="fancy-selector-option">
            <div className="fs-img"> </div>
            <div className="fs-main-info">
              <div className="fs-name">
                <span>{token.name} Portfolio</span>
                <strong>{token.collection}</strong>
              </div>
              <div className="fs-sub">
                <span>Units:</span>
                <strong>
                  {prettyFormatAmount({
                    value: token.balance.toFixed(0),
                    decimals: 0,
                  })}
                </strong>
              </div>
            </div>
          </div>
        ))} */}

        {/* {!pathname.includes(RoutePath.Properties) && (
          <div className="fancy-selector-actions text-right">
            <Link className="btn btn-primary" href={RoutePath.Properties}>
              <i className="os-icon os-icon-ui-22"></i>
              <span>Add Property</span>
            </Link>
          </div>
        )} */}
      </div>
    </div>
  );
}

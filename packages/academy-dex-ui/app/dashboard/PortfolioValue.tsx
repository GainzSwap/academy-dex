"use client";

import { useMemo, useState } from "react";
import AddLiquidity from "./AddLiquidity";
import BigNumber from "bignumber.js";
import { useAccount } from "wagmi";
import { useSwapableTokens } from "~~/components/Swap/hooks";
import { useBasePairAddr } from "~~/hooks/routerHooks";
import { useDeployedContractInfo, useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { useOnPathChange } from "~~/hooks/useContentPanel";
import useGTokens from "~~/hooks/useGTokens";
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
  const { tokens, tokenMap } = useSwapableTokens({ address });
  const { basePairAddr } = useBasePairAddr();
  const basePairIdentifier = tokenMap.get(basePairAddr ?? "")?.identifier;

  const baseToken = useMemo(() => {
    if (!basePairIdentifier) {
      return undefined;
    }

    let baseToken = tokens.at(0);

    !Boolean(baseToken?.identifier.includes(basePairIdentifier)) &&
      tokens.some(token => {
        if (token.identifier.includes(basePairIdentifier)) {
          baseToken = token;
          return true;
        }
      });

    return baseToken;
  }, [tokens, basePairIdentifier]);

  const { lpBalances } = useLpTokens();
  const { gTokens } = useGTokens();
  const { data: GTokens } = useDeployedContractInfo("GTokens");
  const { data: gtokenSymbol } = useScaffoldReadContract({ contractName: "GTokens", functionName: "symbol" });

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

        {!!gTokens?.length && <>GTokens</>}
        {gtokenSymbol &&
          gTokens?.map(({ nonce, attributes: { lpAmount } }) => {
            const identifier = gtokenSymbol + "-" + nonceToRandString(nonce, GTokens?.address || "");
            return (
              <div key={identifier} className="fancy-selector-option">
                <div className="fs-main-info">
                  <div className="fs-name">
                    <span>{identifier}</span>
                  </div>
                  <div className="fs-sub">
                    <span>Liquidity Locked:</span>
                    <strong>{prettyFormatAmount(lpAmount.toString())}</strong>
                  </div>
                  <div className="fs-sub">
                    <span>Nonce:</span>
                    <strong>{nonce.toString()}</strong>
                  </div>
                </div>
              </div>
            );
          })}

        {!!lpBalances?.length && <>LP Tokens</>}
        {lpBalances?.map(({ amount, attributes: { pair }, identifier, nonce }) => {
          return (
            <div key={identifier} className="fancy-selector-option">
              <div className="fs-main-info">
                <div className="fs-name">
                  <span>Pair:&nbsp;{truncateFromInside(pair, 10)}</span>
                  <strong>{identifier}</strong>
                </div>
                <div className="fs-sub">
                  <span>Liquidity:</span>
                  <strong>{prettyFormatAmount(amount.toString())}</strong>
                </div>
                <div className="fs-sub">
                  <span> Nonce:</span>
                  <strong>{nonce.toString()}</strong>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

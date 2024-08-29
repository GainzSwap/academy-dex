import { useMemo } from "react";
import ClaimStakingRewards from "./ClaimStakingRewards";
import StakingModal from "./StakingModal";
import { useModalToShow } from "~~/components/Modals";
import TokenIcon from "~~/components/TokenIcon";
import { TxErrorModal } from "~~/components/TransactionWaitingIcon";
import { useBasePairAddr } from "~~/hooks/routerHooks";
import useGTokens from "~~/hooks/useGTokens";
import useLpTokens, { LpBalancesWithId } from "~~/hooks/useLpTokens";
import { prettyFormatAmount } from "~~/utils/formatAmount";

export default function StakingAndGovernace() {
  const { gTokens } = useGTokens();
  const stakingBalance = useMemo(() => {
    const balanceValue = (gTokens?.flatMap(({ attributes: { lpPayments } }) => lpPayments) ?? [])
      .reduce((stakeTokenValue, { amount }) => stakeTokenValue + amount, 0n)
      .toString();

    return prettyFormatAmount(balanceValue);
  }, [gTokens]);

  const { lpBalances } = useLpTokens();
  const { basePairAddr } = useBasePairAddr();
  const [basePairLPs, otherPairsLPs] = useMemo(() => {
    if (!basePairAddr || !lpBalances) {
      return [[], []];
    }

    return lpBalances.reduce<[LpBalancesWithId, LpBalancesWithId]>(
      (grouped, balance) => {
        const groupIndex = balance.attributes.pair == basePairAddr ? 0 : 1;
        grouped[groupIndex] = [...grouped[groupIndex], balance];

        return grouped;
      },
      [[], []],
    );
  }, [basePairAddr, lpBalances]);

  const { openModal } = useModalToShow();

  return (
    <div className="element-wrapper compact pt-4">
      <h6 className="element-header">Staking</h6>
      <div className="col-12">
        <div className="element-balances justify-content-between mobile-full-width">
          <div className="balance balance-v2" style={{ marginTop: "-35px" }}>
            <div className="balance-title">Your Staking Balance</div>
            <div className="balance-value" style={{ fontSize: "1.5em" }}>
              <span className="d-xxl-none">
                <TokenIcon identifier="ADEX" />
                {stakingBalance}
              </span>
              <span className="d-none d-xxl-inline-block">
                <TokenIcon identifier="ADEX" />
                {stakingBalance}
              </span>
            </div>
          </div>
        </div>
        <div className="element-wrapper pb-4 mb-4 border-bottom">
          <div className="element-box-tp row">
            <div className="col-sm-5">
              <a
                className="btn btn-primary"
                onClick={e => {
                  e.preventDefault();
                  openModal(
                    basePairLPs.length < 1 ? (
                      <TxErrorModal msg="You must add liquidity in ADEX Pair to participate in staking and farming" />
                    ) : (
                      <StakingModal basePairLPs={basePairLPs} otherPairsLPs={otherPairsLPs} />
                    ),
                  );
                }}
              >
                <i className="os-icon os-icon-refresh-ccw"></i>
                <span>Stake Assets</span>
              </a>
            </div>

            <div className="col-sm-7">
              <ClaimStakingRewards />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

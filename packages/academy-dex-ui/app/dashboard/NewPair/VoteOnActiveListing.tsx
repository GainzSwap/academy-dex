import { useMemo, useState } from "react";
import { useNewTokenInfo } from "./hooks";
import Select from "react-select";
import { useAccount, useWriteContract } from "wagmi";
import BlockiesImage from "~~/components/BlockiesImage";
import LoadingState from "~~/components/LoadingState";
import TransactionWaitingIcon, { IconReqState } from "~~/components/TransactionWaitingIcon";
import { useDeployedContractInfo, useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import useGTokens from "~~/hooks/useGTokens";
import { TokenListing, TokenPayment } from "~~/types/utils";
import { prettyFormatAmount } from "~~/utils/formatAmount";
import nonceToRandString from "~~/utils/nonceToRandom";
import { errorMsg } from "~~/components/TransactionWaitingIcon/helpers";

export default function VoteOnActiveListing({
  activeListing: {
    endEpoch: _endEpoch,
    yesVote: _yesVote,
    noVote: _noVote,
    totalLpAmount: _votersLiq,
    owner,
    tradeTokenPayment,
  },
}: {
  activeListing: TokenListing;
}) {
  const { data: _currentEpoch } = useScaffoldReadContract({ contractName: "Governance", functionName: "currentEpoch" });
  const { data: _totalVotersLiq } = useScaffoldReadContract({ contractName: "GTokens", functionName: "totalLpAmount" });
  const { data: gtokenSymbol } = useScaffoldReadContract({ contractName: "GTokens", functionName: "symbol" });
  const { gTokens, refetch: refetchGTokens } = useGTokens();
  const [voteToken, setVoteToken] = useState<TokenPayment>();
  const [voteTx, setVoteTx] = useState<{ isYes: boolean; status: IconReqState }>({ isYes: false, status: "idle" });
  const [error, setError] = useState<string>();

  const { data: GTokens } = useDeployedContractInfo("GTokens");
  const { newTokenInfo } = useNewTokenInfo({ token: tradeTokenPayment.token });
  const { writeContractAsync } = useScaffoldWriteContract("Governance");

  const { address: userAddress } = useAccount();
  const { data: Governance } = useDeployedContractInfo("Governance");
  const { data: govCanSpendUserGTokens } = useScaffoldReadContract({
    contractName: "GTokens",
    functionName: "isApprovedForAll",
    args: [userAddress, Governance?.address],
  });
  const { writeContractAsync: writeContractAsyncGeneric } = useWriteContract();

  const votingTokens = useMemo(
    () =>
      gTokens?.map(token => ({
        value: { amount: token.amount, nonce: token.nonce, token: GTokens?.address } as TokenPayment,
        label: `${prettyFormatAmount(token.attributes.stakeWeight.toString())} ${gtokenSymbol}-${nonceToRandString(token.nonce, GTokens?.address ?? "")} ${token.attributes.epochsLocked}`,
      })),
    [gTokens, gtokenSymbol, GTokens],
  );

  if (_currentEpoch == undefined || _totalVotersLiq == undefined || !GTokens || !gtokenSymbol || !newTokenInfo) {
    return <LoadingState text="Loading Campaign Data" />;
  }

  const currentEpoch = +_currentEpoch.toString();
  const totalVotersLiq = +_totalVotersLiq.toString();

  const endEpoch = +_endEpoch.toString();
  const yesVote = +_yesVote.toString();
  const noVote = +_noVote.toString();
  const votersLiq = +_votersLiq.toString();

  const epochPercentElapsed = (currentEpoch / endEpoch) * 100;
  const voteAcceptance = (totalVotersLiq && votersLiq / totalVotersLiq) * 100;

  const totalVotes = yesVote + noVote;
  const yesPercent = (totalVotes && yesVote / totalVotes) * 100;
  const noPercent = (totalVotes && noVote / totalVotes) * 100;

  const castVote = async (shouldList: boolean) => {
    setError(undefined);

    setVoteTx({ isYes: shouldList, status: "pending" });
    try {
      if (!voteToken || !newTokenInfo) {
        throw new Error("Token information not set or loaded");
      }

      if (!Governance || !GTokens || govCanSpendUserGTokens == undefined) {
        throw new Error("Contracts not loaded");
      }
      !govCanSpendUserGTokens &&
        (await writeContractAsyncGeneric({
          abi: GTokens.abi,
          address: GTokens.address,
          functionName: "setApprovalForAll",
          args: [Governance.address, true],
        }));

      await writeContractAsync(
        { functionName: "vote", args: [voteToken, newTokenInfo.tradeTokenAddr, shouldList] },
        {
          onSettled(_, error) {
            setVoteTx(value => {
              value.status = error ? "error" : "idle";
              return value;
            });

            error && setError(errorMsg(error.toString()));
            refetchGTokens();
          },
        },
      );
    } catch (error: any) {
      setError(errorMsg(error.toString()));
      setVoteTx({ isYes: shouldList, status: "error" });
    }
  };

  return (
    <div className="element-box">
      <div className="row">
        <div className="col-12" style={{ marginBottom: "35px" }}>
          Proposer: {owner} <br />
          Token: {tradeTokenPayment.token} <br />
          Initial Liquidity Amount:{" "}
          <b style={{ fontWeight: "bolder" }}>
            {" "}
            {newTokenInfo.identifier}&nbsp;
            {prettyFormatAmount(tradeTokenPayment.amount.toString(), {
              decimals: newTokenInfo.decimals,
              length: 18,
              minLength: 5,
            })}
          </b>
        </div>

        <div className="col-sm-6">
          <div className="os-progress-bar primary ">
            <div className="bar-labels">
              <div className="bar-label-left">
                <span>Voting Epochs Left</span>
                <span className="positive">{endEpoch - currentEpoch}</span>
              </div>
            </div>
            <div className="bar-level-1" style={{ width: "100%" }}>
              <div className="bar-level-2 progress-bar-striped" style={{ width: epochPercentElapsed + "%" }}></div>
            </div>
          </div>
        </div>
        <div className="col-sm-6">
          <div className={`os-progress-bar ${voteAcceptance < 86 ? "danger" : "success"}`}>
            <div className="bar-labels">
              <div className="bar-label-left">
                <span>Vote Acceptance</span>
                <span className="positive">{voteAcceptance.toFixed(2)}%</span>
              </div>
            </div>
            <div className="bar-level-1" style={{ width: "100%" }}>
              <div className="bar-level-2 progress-bar-striped" style={{ width: voteAcceptance + "%" }}></div>
            </div>
          </div>
        </div>
      </div>
      <h5 className="form-header">Votes</h5>
      <div className="form-desc">
        Ratio of <code className="highlighter-rouge">YES Votes</code> and{" "}
        <code className="highlighter-rouge">NO Votes</code>
        <div className="element-box-content example-content">
          <div className="progress">
            <div
              aria-valuemax={100}
              aria-valuemin={0}
              aria-valuenow={yesPercent}
              className="progress-bar bg-success"
              role="progressbar"
              style={{ width: yesPercent + "%" }}
            >
              {yesPercent.toFixed(2)}
            </div>

            <div
              aria-valuemax={100}
              aria-valuemin={0}
              aria-valuenow={noPercent}
              className="progress-bar bg-danger"
              role="progressbar"
              style={{ width: noPercent + "%" }}
            >
              {noPercent.toFixed(2)}
            </div>
          </div>
        </div>{" "}
      </div>

      <div className="element-box-tp">
        <h6 className="form-header">Cast Vote</h6>

        {error && (
          <>
            <p className="text-danger">{error}</p>
          </>
        )}

        <Select
          name="GTokenSelected"
          placeholder="Select Vote Token"
          onChange={token => {
            setVoteToken(token?.value);
          }}
          styles={{
            option: styles => {
              return { ...styles, color: "black" };
            },
          }}
          options={votingTokens}
        />

        <div className="inline-profile-tiles">
          <div className="row">
            <div className="col-6">
              <div className="profile-tile profile-tile-inlined">
                <button
                  disabled={voteTx.isYes && voteTx.status == "pending"}
                  className="profile-tile-box btn"
                  onClick={() => castVote(true)}
                >
                  <div className="pt-avatar-w">
                    <BlockiesImage seed="Accept" />
                  </div>
                  <div className="pt-user-name">Accept Proposal</div>
                  {voteTx.isYes && <TransactionWaitingIcon iconReqState={voteTx.status} />}
                </button>
              </div>
            </div>
            <div className="col-6">
              <div className="profile-tile profile-tile-inlined">
                <button
                  disabled={!voteTx.isYes && voteTx.status == "pending"}
                  className="profile-tile-box btn"
                  onClick={() => castVote(false)}
                >
                  <div className="pt-avatar-w">
                    <BlockiesImage seed="Reject" />
                  </div>
                  <div className="pt-user-name">Reject Proposal</div>
                  {!voteTx.isYes && <TransactionWaitingIcon iconReqState={voteTx.status} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

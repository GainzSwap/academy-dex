import { useAccount, useWriteContract } from "wagmi";
import TxButton from "~~/components/TxButton";
import { useDeployedContractInfo, useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import useGTokens from "~~/hooks/useGTokens";
import { prettyFormatAmount } from "~~/utils/formatAmount";

export default function ClaimStakingRewards() {
  const { gTokens } = useGTokens();
  const { address: userAddress } = useAccount();

  // const { governance, client } = useRawCallsInfo();
  // useSWR(client && governance && gTokens ?{key:'getSelectedGTokens', client, governance, gTokens}:null,()=>)

  const selectedGToken = gTokens?.toSorted((a, b) => +(a.nonce - b.nonce).toString()).at(0);

  const { data: totalClaimable } = useScaffoldReadContract({
    contractName: "Governance",
    functionName: "getClaimableRewards",
    args: [userAddress, selectedGToken?.nonce],
  });
  const { data: Governance } = useDeployedContractInfo("Governance");

  const { writeContractAsync } = useWriteContract();

  const onClaim = async () => {
    if (!Governance) {
      throw new Error("Governance not loaded");
    }

    if (!selectedGToken) {
      throw new Error("Nothing to claim");
    }

    return writeContractAsync({
      abi: Governance.abi,
      address: Governance.address,
      functionName: "claimRewards",
      args: [selectedGToken.nonce],
    });
  };

  if (!totalClaimable || !userAddress) {
    return null;
  }

  return (
    <TxButton
      className="btn btn-success"
      btnName={`Claim ${prettyFormatAmount(totalClaimable.toString())}`}
      onClick={() => onClaim()}
    />
  );
}

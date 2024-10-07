export default function ClaimLpRewards() {
  // const { lpBalances } = useLpTokens();
  // const { address: userAddress } = useAccount();
  // const { data: totalLpRewardsClaimable } = useScaffoldReadContract({
  //   contractName: "Router",
  //   functionName: "getClaimableRewards",
  //   args: [userAddress],
  // });
  // const { data: Router } = useDeployedContractInfo("Router");
  // const { writeContractAsync } = useWriteContract();
  // const onClaim = async () => {
  //   if (!Router) {
  //     throw new Error("Router not loaded");
  //   }
  //   if (!lpBalances || lpBalances.length < 1) {
  //     throw new Error("Nothing to claim");
  //   }
  //   return writeContractAsync({
  //     abi: Router.abi,
  //     address: Router.address,
  //     functionName: "claimRewards",
  //     args: [
  //       lpBalances
  //         .toSorted((a, b) => +(a.nonce - b.nonce).toString())
  //         .slice(0, 9)
  //         .map(({ nonce }) => nonce),
  //     ],
  //   });
  // };
  // if (!totalLpRewardsClaimable || !userAddress) {
  //   return null;
  // }
  // return (
  //   <TxButton
  //     className="btn btn-success"
  //     btnName={`Claim ${prettyFormatAmount(totalLpRewardsClaimable.toString())}`}
  //     onClick={() => onClaim()}
  //   />
  // );

  // TODO
  console.log('To Review')
}

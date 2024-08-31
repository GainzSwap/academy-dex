import { useNewTokenInfo } from "./hooks";
import { useFormik } from "formik";
import { parseEther, parseUnits } from "viem";
import { useAccount, useWriteContract } from "wagmi";
import FormErrorMessage from "~~/components/FormErrorMessage";
import { useSwapableTokens } from "~~/components/Swap/hooks";
import TxButton from "~~/components/TxButton";
import { useBasePairAddr } from "~~/hooks/routerHooks";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";
import useLpTokens, { useGovernanceSpendsLp } from "~~/hooks/useLpTokens";
import { useSpenderERC20 } from "~~/hooks/useSpendERC20";

export default function CreateNewListing() {
  const { address: userAddress } = useAccount();
  const { data: Governance } = useDeployedContractInfo("Governance");
  const { data: LpToken } = useDeployedContractInfo("LpToken");
  const { writeContractAsync } = useWriteContract();
  const { basePairAddr } = useBasePairAddr();
  const { tokenMap } = useSwapableTokens({ address: userAddress });
  const { lpBalances } = useLpTokens();

  const userAdexInfo = tokenMap.get(basePairAddr ?? "");
  const securityLpPaymentDetails = lpBalances?.find(
    token => token.attributes.pair == userAdexInfo?.pairAddr && token.amount >= parseEther("1000"),
  );

  const { checkApproval } = useSpenderERC20();

  const { handleChange, values, errors, handleSubmit } = useFormik({
    initialValues: {
      amount: 0,
      token: "",
    },
    onSubmit: () => {
      console.log("Submited");
    },
  });

  const { newTokenInfo, newTokenInfoErr, tokenInfoLoading } = useNewTokenInfo({ token: values.token, userAddress });

  const { tryApproveGovLpSpend } = useGovernanceSpendsLp();

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="form-group col-4 col-md-6 col-sm-12 mb-1">
          <label>LP Amount</label>
          <div className="input-group">
            <input
              type="number"
              className={`form-control ${errors.amount ? "is-invalid" : ""}`}
              id="amount"
              name="amount"
              onChange={handleChange}
              value={values.amount}
              placeholder="Enter initial liquidity amount"
            />

            <FormErrorMessage message={errors.amount} />
          </div>
        </div>
        <div className="form-group col-4 col-md-6 col-sm-12 mb-1">
          <label>Token Address</label>
          <div className="input-group">
            <input
              type="text"
              className={`form-control ${errors.token ? "is-invalid" : ""}`}
              id="token"
              name="token"
              onChange={handleChange}
              value={values.token}
              placeholder="Enter Trade Token Address"
            />

            <FormErrorMessage message={errors.token} />
          </div>
        </div>
        <TxButton
          btnName="Propose listing"
          className="btn btn-warning"
          disabled={tokenInfoLoading}
          onClick={async () => {
            if (!Governance || !LpToken) {
              throw new Error("Contracts not loaded");
            }
            if (!userAdexInfo) {
              throw new Error("ADEX token not loaded");
            }

            if (newTokenInfo == undefined) {
              throw newTokenInfoErr ? newTokenInfoErr : new Error("token info not loaded");
            }

            if (!securityLpPaymentDetails) {
              throw new Error("No usable security lp payment");
            }

            const securityPayment = {
              token: LpToken.address,
              amount: securityLpPaymentDetails.amount,
              nonce: securityLpPaymentDetails.nonce,
            };
            const listingFeePayment = { token: userAdexInfo.tradeTokenAddr, amount: parseEther("20"), nonce: 0n };
            const tradeTokenPayment = {
              token: newTokenInfo.tradeTokenAddr,
              amount: parseUnits(values.amount.toString(), newTokenInfo.decimals),
              nonce: 0n,
            };

            console.log({ listingFeePayment, securityPayment, tradeTokenPayment, userAdexInfo, newTokenInfo });

            if (listingFeePayment.amount > BigInt(userAdexInfo.balance)) {
              throw new Error("Listing Fee balance too low");
            }

            if (tradeTokenPayment.amount > BigInt(newTokenInfo.balance)) {
              throw new Error("Trade Token balance too low");
            }

            await tryApproveGovLpSpend();
            await checkApproval({
              spender: Governance.address,
              payment: listingFeePayment,
            });
            await checkApproval({
              spender: Governance.address,
              payment: tradeTokenPayment,
            });

            return writeContractAsync({
              abi: Governance.abi,
              address: Governance.address,
              functionName: "proposeNewPairListing",
              args: [listingFeePayment, securityPayment, tradeTokenPayment],
            });
          }}
        />
      </form>
    </>
  );
}

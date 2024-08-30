import { useCallback, useEffect, useMemo, useState } from "react";
import { useReferralInfo } from "../ReferralCard/hooks";
import { TokenData } from "./types";
import BigNumber from "bignumber.js";
import { useFormik } from "formik";
import RcSlider from "rc-slider";
import useSWR from "swr";
import { erc20Abi, parseUnits } from "viem";
import { useAccount, useBalance } from "wagmi";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import useRawCallsInfo from "~~/hooks/useRawCallsInfo";
import { useSpendERC20 } from "~~/hooks/useSpendERC20";
import { getItem } from "~~/storage/session";
import { RefIdData } from "~~/utils";
import { formatAmount } from "~~/utils/formatAmount";

export const SLIPPAGE_DIVISOR = 10_000;

export const useSlippageAdjuster = () => {
  const [slippage, setSlippage] = useState(0.01);
  const applySlippage = useCallback(
    (value: BigNumber.Value) => new BigNumber(value).multipliedBy(1 - slippage).integerValue(BigNumber.ROUND_FLOOR),
    [slippage],
  );

  const slippageSlider = useMemo(
    () => (
      <div className="mb-3 form-group" style={{ width: "100%" }}>
        <label htmlFor="splippage">Slippage: {(slippage * 100).toFixed(2)} %</label>
        <RcSlider
          defaultValue={slippage * SLIPPAGE_DIVISOR}
          step={25}
          min={10}
          max={1000}
          onChange={value => {
            setSlippage((value as number) / SLIPPAGE_DIVISOR);
          }}
        />
      </div>
    ),
    [slippage],
  );

  return {
    applySlippage,
    slippageSlider,
    slippage,
  };
};

const defaultTokensInfo: {
  tokens: TokenData[];
  tokenMap: Map<string, TokenData>;
} = {
  tokens: [],
  tokenMap: new Map(),
};
export const useSwapableTokens = ({ address: userAddress }: { address?: string }) => {
  const { data: eduBalance } = useBalance({ address: userAddress });
  const { client, router } = useRawCallsInfo();
  const { data: wEDUaddress } = useScaffoldReadContract({ contractName: "Router", functionName: "getWEDU" });

  // Function to fetch token data
  const fetchTokenData = async (tokenAddress: string): Promise<TokenData> => {
    if (!client) {
      throw new Error("Client not set");
    }

    if (!router) {
      throw new Error("Router data not loaded");
    }

    // FIXME improve this call
    const [identifier, balance, decimals, pairAddr] =
      tokenAddress == wEDUaddress && eduBalance
        ? [
            eduBalance.symbol,
            eduBalance.value,
            eduBalance.decimals,
            await client.readContract({
              address: router.address,
              abi: router.abi,
              functionName: "tokensPairAddress",
              args: [tokenAddress],
            }),
          ]
        : await Promise.all([
            client.readContract({
              address: tokenAddress,
              abi: erc20Abi,
              functionName: "symbol",
            }),

            !userAddress
              ? 0n
              : client.readContract({
                  address: tokenAddress,
                  abi: erc20Abi,
                  functionName: "balanceOf",
                  args: [userAddress],
                }),
            client.readContract({
              address: tokenAddress,
              abi: erc20Abi,
              functionName: "decimals",
            }),
            client.readContract({
              address: router.address,
              abi: router.abi,
              functionName: "tokensPairAddress",
              args: [tokenAddress],
            }),
          ]);

    return {
      pairAddr,
      tradeTokenAddr: tokenAddress,
      identifier,
      balance: balance.toString(),
      decimals,
    };
  };

  // Fetch the list of tradeable token addresses from the Router contract
  const { data: tokenAddresses } = useScaffoldReadContract({
    contractName: "Router",
    functionName: "tradeableTokens",
  });

  const {
    data: { tokenMap, tokens },
    mutate,
    isLoading,
  } = useSWR(
    tokenAddresses || null,
    tokenAddresses =>
      Promise.all(tokenAddresses.map(fetchTokenData)).then(tokens => {
        const structure = tokens.reduce((structure, token) => {
          structure.tokenMap.set(token.pairAddr, token);
          structure.tokenMap.set(token.tradeTokenAddr, token);

          return structure;
        }, defaultTokensInfo);

        structure.tokens = tokens;

        return structure;
      }),
    {
      fallbackData: (() => defaultTokensInfo)(),
      keepPreviousData: true,
    },
  );

  return {
    fetchTokenData,
    updateSwapableTokens: mutate,
    tokens,
    tokenMap,
    isTokensLoaded: !isLoading,
    wEDUaddress,
  };
};

export const useSwapTokensForm = ({
  fromToken,
  toToken,
  sendBalance,
  slippage: slippage_,
}: {
  fromToken?: TokenData;
  toToken?: TokenData;
  sendBalance: string;
  slippage: BigNumber.Value;
}) => {
  const { address } = useAccount();
  const { updateSwapableTokens, wEDUaddress } = useSwapableTokens({ address });

  const slippage = parseUnits(slippage_.toString(), SLIPPAGE_DIVISOR.toString().length - 1);

  const { client, router } = useRawCallsInfo();
  const { writeContractAsync: writeRouter } = useScaffoldWriteContract("Router");
  const { checkApproval } = useSpendERC20({ token: fromToken });

  const { refIdData, refresh: refreshUserRefInfo } = useReferralInfo();

  const { handleSubmit, handleChange, values, setFieldValue, setFieldError, errors, touched, resetForm } = useFormik({
    initialValues: {
      sendAmt: "",
      receiveAmt: "",
      feePercent: "",
    },
    onSubmit: async ({ sendAmt }, { setFieldError, resetForm }) => {
      try {
        if (!fromToken || !toToken || !router || !refIdData || !wEDUaddress) {
          throw new Error("Missing necessary data for the swap");
        }

        const payment = {
          token: fromToken.tradeTokenAddr,
          amount: parseUnits(BigNumber(sendAmt).toFixed(fromToken.decimals), fromToken.decimals),
          nonce: 0n,
        };
        // Prepare for when swaping native coins
        const value = payment.token == wEDUaddress ? payment.amount : undefined;
        !value && (await checkApproval(payment.amount));

        if (refIdData.getUserID() === null) {
          const referrerLink = getItem("userRefBy");
          const referrerId = referrerLink ? BigInt(RefIdData.getID(referrerLink)) : 0n;
          await writeRouter({
            functionName: "registerAndSwap",
            args: [referrerId, payment, toToken.pairAddr, slippage],
            value,
          });
          await refreshUserRefInfo();
        } else {
          await writeRouter({
            functionName: "swap",
            args: [payment, toToken.pairAddr, slippage],
            value,
          });
        }

        updateSwapableTokens();
        resetForm();
      } catch (error: any) {
        setFieldError("sendAmt", error.toString());
      }
    },
  });

  const sendAmountHaserror = (errors.sendAmt || errors.receiveAmt) && touched.sendAmt;

  const { isValidating: isCalculatingReceiveAmt, error: receiveAmtCalcErr } = useSWR(
    !!+values.sendAmt && toToken && fromToken && client && router
      ? {
          sendAmt: parseUnits(BigNumber(values.sendAmt).toFixed(fromToken.decimals), fromToken.decimals),
          toToken,
          fromToken,
          slippage,
          client,
          router,
        }
      : null,
    async ({ sendAmt, fromToken, toToken, slippage, client, router }) => {
      const amountOut = await client.readContract({
        abi: router.abi,
        address: router.address,
        functionName: "estimateOutAmount",
        args: [fromToken.pairAddr, toToken.pairAddr, sendAmt, slippage],
      });

      const feePercent = await client.readContract({
        abi: router.abi,
        address: router.address,
        functionName: "computeFeePercent",
        args: [fromToken.pairAddr, sendAmt],
      });

      setFieldValue(
        "receiveAmt",
        formatAmount({
          input: amountOut,
          decimals: toToken.decimals,
        }),
      );
      setFieldValue(
        "feePercent",
        formatAmount({
          input: feePercent,
          decimals: 2,
          digits: 2,
        }),
      );
    },
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      refreshInterval: 6_000,
      loadingTimeout: 1900,
    },
  );

  const onMax = useCallback(() => {
    setFieldValue("sendAmt", sendBalance);
  }, [sendBalance]);

  // Update form with receiveAmt errors if any
  useEffect(() => {
    setFieldError("receiveAmt", receiveAmtCalcErr?.toString());
  }, [receiveAmtCalcErr]);

  return {
    handleSubmit,
    handleChange,
    onMax,
    resetForm,
    sendAmountHaserror,
    isCalculatingReceiveAmt,
    values,
    errors,
  };
};

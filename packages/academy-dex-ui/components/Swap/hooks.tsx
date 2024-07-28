import { useCallback, useEffect, useMemo, useState } from "react";
import { TokenData } from "./types";
import BigNumber from "bignumber.js";
import { useFormik } from "formik";
import RcSlider from "rc-slider";
import useSWR from "swr";
import { erc20Abi } from "viem";
import { usePublicClient } from "wagmi";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
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
      <div className="mb-3 form-group">
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

// /**
//  * Converts tokenID appropriately from egldLabel to wrappedEgldLabel
//  */
// export const normaliseTokenID = ({ id, wegldID }: { id: string; wegldID: string }) => (id === egldLabel ? wegldID : id);

export const useSwapableTokens = ({
  address,
  fromToken,
  toToken,
}: {
  address?: string;
  fromToken?: TokenData;
  toToken?: TokenData;
}) => {
  const client = usePublicClient();

  // Function to fetch token data
  const fetchTokenData = async (tokenAddress: string): Promise<TokenData> => {
    if (!client) {
      throw new Error("Client not set");
    }
    if (!address) {
      throw new Error("User address not loaded");
    }

    const [identifier, balance, decimals] = await Promise.all([
      client.readContract({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: "symbol",
      }),
      client.readContract({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [address],
      }),
      client.readContract({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: "decimals",
      }),
    ]);

    // TODO Construct icon source URL based on token identifier
    const iconSrc = ``;

    return {
      identifier,
      balance: balance.toString(),
      iconSrc,
      decimals,
    };
  };

  // Fetch the list of tradeable token addresses from the Router contract
  const { data: tokenAddresses } = useScaffoldReadContract({
    contractName: "Router",
    functionName: "tradeableTokens",
  });

  const {
    data: fetchedTokens,
    mutate,
    isLoading,
  } = useSWR(tokenAddresses || null, tokenAddresses => Promise.all(tokenAddresses.map(fetchTokenData)), {
    fallbackData: [],
    keepPreviousData: true,
  });

  // Filter out `fromToken` and `toToken` from the fetched tokens
  const filteredTokens = fetchedTokens?.filter(
    token => token.identifier !== fromToken?.identifier && token.identifier !== toToken?.identifier,
  );

  return {
    updateSwapableTokens: mutate,
    tokens: filteredTokens,
    isTokensLoaded: !isLoading,
  };
};

// const minSendAmount = formatAmount({ input: "100000" });
export const useSwapTokensForm = ({
  fromToken,
  toToken,
  sendBalance,
  applySlippage,
}: {
  fromToken?: TokenData;
  toToken?: TokenData;
  sendBalance: string;
  applySlippage: (value: BigNumber.Value) => BigNumber;
}) => {
  const { handleSubmit, handleChange, values, setFieldValue, setFieldError, errors, touched, resetForm } = useFormik({
    initialValues: {
      sendAmt: "",
      receiveAmt: "",
    },
    onSubmit({ sendAmt, receiveAmt }, { setFieldError }) {
      try {
        // if (!wrappedEGLDSC || !wegldID) {
        //   throw new Error("wrappedEGLDSC not set, try again");
        // }
        // if (!fromToken || !toToken) {
        //   throw new Error("Both tokens must be set");
        // }
        // const sendAmount = sendAmt.toString(); // ensure it is string
        // const fromTokenIsEgld = fromToken.identifier === egldLabel || fromToken.identifier === wegldID;
        // const toTokenIsEgld = toToken.identifier === egldLabel || toToken.identifier === wegldID;
        // if (fromTokenIsEgld && toTokenIsEgld) {
        //   // Set swap direction
        //   const egldWegldSwapTx =
        //     fromToken.identifier === wegldID
        //       ? wrappedEGLDSC.makeUnwrapEGLD(TokenPayment.fungibleFromAmount(wegldID, sendAmount, 18))
        //       : wrappedEGLDSC.makeWrapEGLD({
        //           amt: parseAmount(sendAmount, 18),
        //         });
        //   setGenericTransaction([egldWegldSwapTx]);
        // }
        // if (!swapAction) {
        //   throw new Error("Swap Pairs not set");
        // }
        // const payload = (() => {
        //   if ("reserve" in swapAction) {
        //     // Do OneDex swap
        //     const sendValue = fromTokenIsEgld
        //       ? parseAmount(sendAmount)
        //       : TokenTransfer.fungibleFromAmount(fromToken.identifier, sendAmount, fromToken.decimals);
        //     const amount_out = parseAmount(receiveAmt, toToken.decimals);
        //     const transaction = oneDexSc.makeSwapMultiTokensFixedInput({
        //       amount_out,
        //       path: swapAction.path,
        //       sendValue,
        //       unwrap_required: toTokenIsEgld,
        //     });
        //     return [transaction];
        //   } else if (swapAction.length) {
        //     // Do xExchange Swap
        //     const {
        //       dataHelper: { tx: transaction },
        //     } = getApiComms().router.makeMultiPairSwap({
        //       swapOperations: swapAction,
        //       sendValue: TokenPayment.fungibleFromAmount(
        //         fromTokenIsEgld ? wegldID : fromToken.identifier,
        //         sendAmount,
        //         fromToken.decimals,
        //       ),
        //     });
        //     const payload = [transaction];
        //     if (fromTokenIsEgld) {
        //       const wrapTx = wrappedEGLDSC.makeWrapEGLD({
        //         amt: parseAmount(sendAmount, 18),
        //       });
        //       payload.unshift(wrapTx);
        //     } else if (toTokenIsEgld) {
        //       const unwrapTx = wrappedEGLDSC.makeUnwrapEGLD(TokenPayment.fungibleFromAmount(wegldID, receiveAmt, 18));
        //       payload.push(unwrapTx);
        //     }
        //     return payload;
        //   }
        //   throw new Error("No implementation for selected exchange");
        // })();
        // setGenericTransaction(payload);
      } catch (error: any) {
        setFieldError("sendAmt", error.toString());
      }
    },
    // validationSchema: object().shape({
    //   sendAmt: string()
    //     .required("The send amount field is required")
    //     .test("maximum", `Maximum send of ${fromToken?.identifier} for your account is: ${sendBalance}`, _value => {
    //       const value = parseAmount(_value || "0", fromToken?.decimals);

    //       const amount = new BigNumber(value);
    //       const maxAmount = new BigNumber(fromToken?.balance || "");

    //       return amount.comparedTo(maxAmount) <= 0;
    //     })
    //     .test("tokensRequired", "Both `From` and `To` tokens must be set", () => Boolean(fromToken && toToken))

    //     .test("minimum", `Minimum send is ${minSendAmount}`, _v => {
    //       const value = parseAmount(_v || "0");
    //       const amount = new BigNumber(value);
    //       const minAmount = new BigNumber(parseAmount(minSendAmount));

    //       return amount.isGreaterThanOrEqualTo(minAmount);
    //     }),
    //   receiveAmt: string()
    //     .required()
    //     .test("receiveAmt", "Please wait for Receive amount to be calculated", value => !!!value || value != "0"),
    // }),
  });

  const sendAmountHaserror = (errors.sendAmt || errors.receiveAmt) && touched.sendAmt;

  const { isValidating: isCalculatingReceiveAmt, error: receiveAmtCalcErr } = useSWR(
    !!+values.sendAmt && toToken && fromToken
      ? {
          sendAmt: values.sendAmt,
          toToken,
          fromToken,
          applySlippage,
        }
      : null,
    async ({ sendAmt, fromToken, toToken, applySlippage }) => {
      // TODO compute
      const amountOut = '0';
      setFieldValue(
        "receiveAmt",
        formatAmount({
          input: amountOut,
          decimals: toToken.decimals,
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

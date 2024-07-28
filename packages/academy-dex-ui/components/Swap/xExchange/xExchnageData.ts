import { useCallback, useMemo } from "react";
import { useWEGLD } from "../WEGLD/wrappedEGLDdata";
import { SwapPath, xExchangeSwapPaths, xExchangeSwapStep } from "../types";
import { BigNumber } from "@crypt-gain-web/api-comms/src";
import { State as PairState } from "@crypt-gain-web/api-comms/src/contracts/pair";
import type { useSlippageAdjuster } from "src/app/@user/hooks";
import { getApiComms } from "src/providers/apiCommsProvider";
import useSwr from "swr";

const minReserve = 1000;

const cachedSwapPaths: { [key: string]: xExchangeSwapPaths | undefined } = {};

const joiner = "@";
const makePair = ([from, to]: [string, string]) => `${from}${joiner}${to}`;
const makePath = (pair: string) => pair.split(joiner);

interface PairData {
  pair_address: string;
  first_token_id: string;
  second_token_id: string;
  first_token_reserve: BigNumber;
  second_token_reserve: BigNumber;
  lp_token_supply: string;
  state: PairState;
}

export const useXExchange = ({ cgIdentifier }: { cgIdentifier?: string }) => {
  const { wegldID } = useWEGLD();
  const { data: pairMetadata } = useSwr("xExchangePairMetadata", () =>
    getApiComms().router.getAllPairContractMetadata(),
  );
  const { data: pairsData } = useSwr(
    pairMetadata && { key: "xExchangePairsData", value: pairMetadata },
    ({ value }) =>
      Promise.all(
        value.map(async ({ address, first_token_id, second_token_id }) => {
          const pairContract = getApiComms().pair_copy.newInstance(address);
          const [{ first_token_reserve, second_token_reserve, total_supply }, state] = await Promise.all([
            pairContract.getReservesAndTotalSupply(),
            pairContract.getState(),
          ]);

          const data: PairData = {
            pair_address: address,
            first_token_id,
            second_token_id,
            first_token_reserve,
            second_token_reserve,
            lp_token_supply: total_supply.toFixed(0),
            state,
          };

          return data;
        }),
      ),
    { refreshInterval: 3_000, keepPreviousData: true },
  );

  const { tradeableTokens, tradePairs, governanceLPPair } = useMemo(() => {
    let tradeableTokens: string[] = [];
    const tradePairs: {
      [key: string]: { reserve: string; pair_address: string };
    } = {};

    let governanceLPPair: PairData | undefined;

    const addToken = (token: string) => {
      !tradeableTokens.includes(token) && tradeableTokens.push(token);
    };

    pairsData?.forEach(pair => {
      const { first_token_id, second_token_id, first_token_reserve, second_token_reserve, pair_address, state } = pair;
      if (
        state === PairState.Active &&
        first_token_reserve.isGreaterThan(minReserve) &&
        second_token_reserve.isGreaterThan(minReserve)
      ) {
        // governacnceLPPair
        if (first_token_id === cgIdentifier && second_token_id === wegldID) {
          governanceLPPair = pair;
        }

        // tokens
        addToken(first_token_id);
        addToken(second_token_id);

        // tradePairs
        const forwardPath = makePair([first_token_id, second_token_id]);
        const forwardReserve = second_token_reserve;

        const reversePath = makePair([second_token_id, first_token_id]);
        const reverseReserve = first_token_reserve;

        tradePairs[forwardPath] = {
          pair_address,
          reserve: forwardReserve.toFixed(0),
        };
        tradePairs[reversePath] = {
          pair_address,
          reserve: reverseReserve.toFixed(0),
        };
      }
    });

    return { tradeableTokens, tradePairs, governanceLPPair };
  }, [pairsData, cgIdentifier]);

  const partialPaths = useCallback(
    ([fromTokenID, toTokenID]: [string, string], depth = 0) => {
      const cacheKey = makePair([fromTokenID, toTokenID]);

      const cachedSwapPath = cachedSwapPaths[cacheKey];
      if (cachedSwapPath) {
        return cachedSwapPath;
      }

      const paths: {
        complete: SwapPath[];
        fromInBetween: SwapPath[];
        toInBetween: SwapPath[];
      } = { complete: [], fromInBetween: [], toInBetween: [] };

      // inclusivePaths
      for (const pair in tradePairs) {
        if (!(pair.includes(fromTokenID) || pair.includes(toTokenID))) {
          continue;
        }

        const path = makePath(pair);

        const hasFrom = path[0] === fromTokenID;
        const hasTo = path.at(-1) === toTokenID;

        if (hasFrom && hasTo) {
          paths.complete.push(path);
        } else if (hasFrom) {
          paths.fromInBetween.push(path);
        } else if (hasTo) {
          paths.toInBetween.push(path);
        }
      }

      while (paths.fromInBetween.length > 0 && depth <= 4) {
        const fromIDxBetween = paths.fromInBetween.pop();
        if (fromIDxBetween?.length) {
          const last_fromIDxBetween = fromIDxBetween.at(-1)!;

          for (const toIDxBetween of paths.toInBetween) {
            const [first_toIDxBetween] = toIDxBetween;
            if (first_toIDxBetween == last_fromIDxBetween) {
              // Glue them
              paths.complete.push([...fromIDxBetween, ...toIDxBetween.slice(1)]);
            } else {
              // Search for intermediates
              const intermediate_path: [string, string] = [last_fromIDxBetween, first_toIDxBetween];

              partialPaths(intermediate_path, depth + 1).forEach(({ path }) => {
                if (!(path.includes(fromTokenID) || path.includes(toTokenID))) {
                  paths.complete.push([fromTokenID, ...path, toTokenID]);
                } else if (path.at(0) == fromTokenID && !path.includes(toTokenID)) {
                  paths.complete.push([...path, toTokenID]);
                } else if (path.at(-1) == toTokenID && !path.includes(fromTokenID)) {
                  paths.complete.push([fromTokenID, ...path]);
                }
              });
            }
          }
        }
      }

      let swapPaths = paths.complete.map(path => {
        let steps: xExchangeSwapStep[] = [];
        let from: string | undefined;

        for (const to of path) {
          if (from) {
            steps.push({
              ...tradePairs[makePair([from, to])],
              token_wanted: to,
              token_in: from,
            });
          }
          from = to;
        }

        return { path, steps };
      });

      if (swapPaths.length) {
        cachedSwapPaths[cacheKey] = swapPaths;
      }

      return swapPaths;
    },
    [tradePairs],
  );

  const tokenSwapRoutes = useCallback(
    ({ fromTokenID, toTokenID }: { fromTokenID: string; toTokenID: string }) => partialPaths([fromTokenID, toTokenID]),

    [partialPaths],
  );

  return {
    tradePairs,
    tradeableTokens,
    wegldID,
    tokenSwapRoutes,
    governanceLPPair,
  };
};

export const useAmountsOutForLiquidity = ({
  liquidity,
  applySlippage,
}: {
  liquidity: string;
  applySlippage: ReturnType<typeof useSlippageAdjuster>["applySlippage"];
}) => {
  const { data: outTokens, isLoading: outTokensLoading } = useSwr(
    liquidity
      ? {
          key: "useAmountsOutForLiquidity",
          liquidity,
          applySlippage,
        }
      : null,
    ({ liquidity, applySlippage }) =>
      getApiComms()
        .pair_copy.getTokensForGivenPosition(liquidity)
        .then(({ first_token, second_token }) => ({
          first_token: {
            ...first_token,
            amount: applySlippage(first_token.amount).toFixed(0),
          },
          second_token: {
            ...second_token,
            amount: applySlippage(second_token.amount).toFixed(0),
          },
        })),
    { keepPreviousData: true, refreshInterval: 3_000 },
  );

  return { outTokens, outTokensLoading };
};

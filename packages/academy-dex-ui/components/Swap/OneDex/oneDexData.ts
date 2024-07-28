import { useCallback, useMemo } from "react";
import { useWEGLD } from "../WEGLD/wrappedEGLDdata";
import { OneDexSwapPaths } from "../types";
import oneDexSc, { Pair } from "./OneDexSC";
import useSwr from "swr";

const cachedSwapPaths: { [key: string]: OneDexSwapPaths | undefined } = {};

const joiner = "@";
const makePair = ([from, to]: [string, string]) => `${from}${joiner}${to}`;
const makePath = (pair: string) => pair.split(joiner);

export const useOneDexData = ({ cgIdentifier }: { cgIdentifier?: string }) => {
  const { wegldID } = useWEGLD();

  const { data: _oneDexPairs } = useSwr("viewOneDexPairs", () => oneDexSc.viewPairs(), { refreshInterval: 2_500 });

  const oneDexPairs = useMemo(
    () => _oneDexPairs?.filter(pair => pair.state == "Active" && pair.enabled),
    [_oneDexPairs],
  );
  const {
    tokens: oneDexTradeableTokens,
    tradePairs: oneDexTradePairs,
    governanceLPPair,
  } = useMemo(() => {
    let tokens: string[] = [];
    const tradePairs: {
      [key: string]: string | undefined;
    } = {};

    let governanceLPPair: Pair | undefined;

    const addToken = (token: string) => {
      !tokens.includes(token) && tokens.push(token);
    };

    oneDexPairs?.forEach(pair => {
      const { first_token_id, second_token_id, first_token_reserve, second_token_reserve } = pair;
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

      tradePairs[forwardPath] = forwardReserve;
      tradePairs[reversePath] = reverseReserve;
    });

    return { tokens, tradePairs, governanceLPPair };
  }, [oneDexPairs, wegldID, cgIdentifier]);

  const partialPaths = useCallback(
    ([fromTokenID, toTokenID]: [string, string], depth = 0) => {
      const cacheKey = makePair([fromTokenID, toTokenID]);

      const complete = cachedSwapPaths[cacheKey];
      if (complete) {
        return complete;
      }

      const paths: {
        complete: OneDexSwapPaths;
        fromInBetween: OneDexSwapPaths;
        toInBetween: OneDexSwapPaths;
      } = { complete: [], fromInBetween: [], toInBetween: [] };

      const inclusivePaths = Object.entries(oneDexTradePairs)
        .filter(([pair]) => pair.includes(fromTokenID) || pair.includes(toTokenID))
        .map(([pair, reserve]) => ({
          path: makePath(pair),
          reserve: reserve || "0",
        }));

      for (const swapPath of inclusivePaths) {
        const path = swapPath.path;

        const hasFrom = path[0] === fromTokenID;
        const hasTo = path.at(-1) === toTokenID;

        if (hasFrom && hasTo) {
          paths.complete.push(swapPath);
        } else if (hasFrom) {
          paths.fromInBetween.push(swapPath);
        } else if (hasTo) {
          paths.toInBetween.push(swapPath);
        }
      }

      while (paths.fromInBetween.length > 0 && depth <= 4) {
        const fromIDxBetween = paths.fromInBetween.pop();
        if (fromIDxBetween?.path.length) {
          const last_fromIDxBetween = fromIDxBetween.path.at(-1)!;

          for (const toIDxBetween of paths.toInBetween) {
            const [first_toIDxBetween] = toIDxBetween.path;
            if (first_toIDxBetween == last_fromIDxBetween) {
              // Glue them
              paths.complete.push({
                path: [...fromIDxBetween.path, ...toIDxBetween.path.slice(1)],
                reserve: toIDxBetween.reserve,
              });
            } else {
              // Search for intermediates
              const intermediate_path: [string, string] = [last_fromIDxBetween, first_toIDxBetween];

              partialPaths(intermediate_path, depth + 1).forEach(path => {
                !(path.path.includes(fromTokenID) || path.path.includes(toTokenID)) &&
                  paths.complete.push({
                    path: [fromTokenID, ...path.path, toTokenID],
                    reserve: oneDexTradePairs[makePair([path.path.at(-1)!, toTokenID])] || "0",
                  });
              });
            }
          }
        }
      }

      return (cachedSwapPaths[cacheKey] = paths.complete);
    },
    [oneDexTradePairs],
  );

  const tokenSwapRoutes = useCallback(
    ({ fromTokenID, toTokenID }: { fromTokenID: string; toTokenID: string }) => partialPaths([fromTokenID, toTokenID]),

    [partialPaths],
  );

  return {
    oneDexTradePairs,
    oneDexTradeableTokens,
    wegldID,
    tokenSwapRoutes,
    governanceLPPair,
  };
};

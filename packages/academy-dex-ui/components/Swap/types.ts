export interface TokenData {
  identifier: string;
  tradeTokenAddr: string;
  pairAddr: string;
  balance: string;
  decimals: number;
}

export type SwapStep = {
  tokenWanted: string;
  tokenIn: string;
  reserve: string;
  pairAddress: string;
};

export type SwapPath = string[];

export type SwapPaths = {
  path: SwapPath;
  steps: SwapStep[];
}[];

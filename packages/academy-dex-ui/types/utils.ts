export type Tuple<T, MaxLength extends number = 10, Current extends T[] = []> = Current["length"] extends MaxLength
  ? Current
  : Current | Tuple<T, MaxLength, [T, ...Current]>;

export interface TokenPayment {
  amount: bigint;
  nonce: bigint;
  token: string;
}
export interface TokenListing {
  yesVote: bigint;
  noVote: bigint;
  totalLpAmount: bigint;
  endEpoch: bigint;
  owner: string;
  securityLpPayment: TokenPayment;
  tradeTokenPayment: TokenPayment;
  campaignId: bigint;
}

import { BigNumber } from "@crypt-gain-web/api-comms/src";
import { formatAmount } from "src/utils/operations";

export const outAmount = ({
  inAmount,
  inBalance,
  outBalance,
  outReserve,
  inReserve,
}: {
  inAmount: BigNumber;
  inBalance: BigNumber;
  outBalance: BigNumber;
  outReserve: BigNumber;
  inReserve: BigNumber;
}) => {
  if (inAmount.isGreaterThan(0) && inBalance.isGreaterThanOrEqualTo(inAmount)) {
    const outAmount = outReserve.multipliedBy(inAmount).dividedBy(inReserve);

    if (outBalance.isGreaterThanOrEqualTo(outAmount)) return formatAmount({ input: outAmount.toFixed(0) });
  }

  return "0";
};

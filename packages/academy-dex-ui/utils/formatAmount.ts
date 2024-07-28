import { TokenTransfer } from "@multiversx/sdk-core";
import BigNumber from "bignumber.js";

export const stringIsInteger = (integer: string, positiveNumbersOnly = true) => {
  const stringInteger = String(integer);
  if (!stringInteger.match(/^[-]?\d+$/)) {
    return false;
  }
  const bNparsed = new BigNumber(stringInteger);
  const limit = positiveNumbersOnly ? 0 : -1;
  return bNparsed.toString(10) === stringInteger && bNparsed.comparedTo(0) >= limit;
};

export function pipe<ValueType>(previous: ValueType) {
  return {
    if: function (condition: boolean) {
      if (condition) {
        return {
          then: (newValue: ValueType | ((prop: ValueType) => ValueType)) =>
            // if a callback is passed, callback is executed with previous value
            newValue instanceof Function ? pipe(newValue(previous)) : pipe(newValue),
        };
      } else {
        return {
          then: () => pipe(previous),
        };
      }
    },

    then: (newValue: ValueType | ((prop: ValueType) => ValueType)) =>
      newValue instanceof Function ? pipe(newValue(previous)) : pipe(newValue),

    valueOf: function () {
      return previous;
    },
  };
}

BigNumber.config({ ROUNDING_MODE: BigNumber.ROUND_FLOOR });

export interface FormatAmountType {
  input: string | bigint;
  decimals?: number;
  digits?: number;
  showIsLessThanDecimalsLabel?: boolean;
  showLastNonZeroDecimal?: boolean;
  addCommas?: boolean;
}

export function formatAmount({
  input,
  decimals = 18,
  digits = 4,
  showLastNonZeroDecimal = true,
  showIsLessThanDecimalsLabel = false,
  addCommas = false,
}: FormatAmountType) {
  input = input.toString();

  if (!stringIsInteger(input, false)) {
    throw new Error("Invalid input");
  }

  const isNegative = new BigNumber(input).isNegative();
  let modInput = input;

  if (isNegative) {
    // remove - at start of input
    modInput = input.substring(1);
  }

  return (
    pipe(modInput as string)
      // format
      .then(() =>
        TokenTransfer.fungibleFromBigInteger("", modInput as string, decimals)
          .amountAsBigInteger.shiftedBy(-decimals)
          .toFixed(decimals),
      )

      // format
      .then(current => {
        const bnBalance = new BigNumber(current);

        if (bnBalance.isZero()) {
          return "0";
        }
        const balance = bnBalance.toString(10);
        const [integerPart, decimalPart] = balance.split(".");
        const bNdecimalPart = new BigNumber(decimalPart || 0);

        const decimalPlaces = pipe(0)
          .if(Boolean(decimalPart && showLastNonZeroDecimal))
          .then(() => Math.max(decimalPart.length, digits))

          .if(bNdecimalPart.isZero() && !showLastNonZeroDecimal)
          .then(0)

          .if(Boolean(decimalPart && !showLastNonZeroDecimal))
          .then(() => Math.min(decimalPart.length, digits))

          .valueOf();

        const shownDecimalsAreZero =
          decimalPart &&
          digits >= 1 &&
          digits <= decimalPart.length &&
          bNdecimalPart.isGreaterThan(0) &&
          new BigNumber(decimalPart.substring(0, digits)).isZero();

        const formatted = bnBalance.toFormat(decimalPlaces);

        const formattedBalance = pipe(balance)
          .if(addCommas)
          .then(formatted)

          .if(Boolean(shownDecimalsAreZero))
          .then(current => {
            const integerPartZero = new BigNumber(integerPart).isZero();
            const [numericPart, decimalSide] = current.split(".");

            const zeroPlaceholders = new Array(digits - 1).fill(0);
            const zeros = [...zeroPlaceholders, 0].join("");
            const minAmount = [...zeroPlaceholders, 1].join(""); // 00..1

            if (!integerPartZero) {
              return `${numericPart}.${zeros}`;
            }

            if (showIsLessThanDecimalsLabel) {
              return `<${numericPart}.${minAmount}`;
            }

            if (!showLastNonZeroDecimal) {
              return numericPart;
            }

            return `${numericPart}.${decimalSide}`;
          })

          .if(Boolean(!shownDecimalsAreZero && decimalPart))
          .then(current => {
            const [numericPart] = current.split(".");
            let decimalSide = decimalPart.substring(0, decimalPlaces);

            if (showLastNonZeroDecimal) {
              const noOfZerosAtEnd = digits - decimalSide.length;

              if (noOfZerosAtEnd > 0) {
                const zeroPadding = Array(noOfZerosAtEnd).fill(0).join("");
                decimalSide = `${decimalSide}${zeroPadding}`;
                return `${numericPart}.${decimalSide}`;
              }

              return current;
            }

            if (!decimalSide) {
              return numericPart;
            }

            return `${numericPart}.${decimalSide}`;
          })

          .valueOf();

        return formattedBalance;
      })
      .if(isNegative)
      .then(current => `-${current}`)

      .valueOf()
  );
}

export function prettyFormatAmount(
  value: string,
  { length, minLength, decimals } = {
    length: 8,
    minLength: 30,
    decimals: 18,
  },
) {
  let digits = value.length <= minLength ? length : length - (value.length - minLength);
  return formatAmount({
    input: value,
    digits: digits <= 0 ? 0 : digits,
    showLastNonZeroDecimal: false,
    showIsLessThanDecimalsLabel: true,
    addCommas: true,
    decimals,
  });
}

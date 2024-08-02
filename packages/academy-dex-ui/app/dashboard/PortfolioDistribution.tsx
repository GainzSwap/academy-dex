import React, { useEffect, useMemo, useRef } from "react";
import BigNumber from "bignumber.js";
import { ChartData } from "chart.js";
import useSWR from "swr";
import { useAccount } from "wagmi";
import { useSwapableTokens } from "~~/components/Swap/hooks";
import { TokenData } from "~~/components/Swap/types";
import useRawCallsInfo from "~~/hooks/useRawCallsInfo";
import Chart from "~~/utils/chart";
import { prettyFormatAmount } from "~~/utils/formatAmount";
import getColor from "~~/utils/getColor";

interface IPortfolioHighlight {
  backgroundColor: string;
  data: string;
  title: string;
}
const PortfolioHighlight: React.FC<IPortfolioHighlight> = ({ backgroundColor, data, title, ...props }) => (
  <div {...props} className="legend-value-w">
    <div
      className="legend-pin legend-pin-squared"
      style={{
        backgroundColor,
      }}
    ></div>
    <div className="legend-value">
      <span>{data}</span>
      <div className="legend-sub-value">{title}</div>
    </div>
  </div>
);

let chart: Chart | undefined;

export default function PortfolioDistribution() {
  const { address } = useAccount();
  const { tokens } = useSwapableTokens({ address });

  const doughnutChartRef = useRef<HTMLCanvasElement>(null);
  const { client, pairInfo } = useRawCallsInfo();

  const { data: baseReserve } = useSWR(
    pairInfo && client ? { pairInfo, client, tokens } : null,
    ({ pairInfo, client, tokens }) => {
      const [basePair] = tokens.filter(token => token.identifier.includes("BASE"));

      return client.readContract({ abi: pairInfo.abi, address: basePair.pairAddr, functionName: "reserve" });
    },
  );

  const portFolioCoins = useMemo(() => tokens.filter(token => !BigNumber(token.balance).isZero()), [tokens]);
  const { data: coinsWithPrice } = useSWR(
    baseReserve && client && pairInfo ? { baseReserve, pairInfo, client, coins: portFolioCoins } : null,
    ({ client, coins, pairInfo, baseReserve }) =>
      Promise.all(
        coins.map(coin =>
          client.readContract({ abi: pairInfo.abi, address: coin.pairAddr, functionName: "reserve" }).then(reserve => ({
            ...coin,
            price: BigNumber(coin.balance)
              .multipliedBy(baseReserve.toString())
              .dividedBy(reserve.toString())
              .toFixed(0),
          })),
        ),
      ),
  );

  useEffect(() => {
    if (!coinsWithPrice) {
      return;
    }

    const values: any[] = [];
    const backgroundColor: string[] = [];
    const labels: string[] = [];

    for (const { tradeTokenAddr, identifier, price } of coinsWithPrice) {
      values.push(price);
      backgroundColor.push(getColor(tradeTokenAddr, 5));
      labels.push(identifier + " BASE Value");
    }

    const data: ChartData<"doughnut"> = {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor,
          hoverBackgroundColor: backgroundColor,
          borderColor: "transparent",
          hoverBorderColor: "transparent",
        },
      ],
    };

    if (!chart || !chart.canvas) {
      chart = new Chart(doughnutChartRef.current!, {
        type: "doughnut",
        data,
        options: {
          // @ts-ignore
          cutout: "80%",
          plugins: {
            tooltip: {
              callbacks: {
                beforeBody(tooltipItems) {
                  const value = tooltipItems[0].raw as string;
                  tooltipItems[0].formattedValue = prettyFormatAmount(value); // denominateWithMaxPrecision(18, value);
                },
              },
            },
          },
        },
      });
    } else {
      chart.data = data;
      chart.update();
    }
  }, [coinsWithPrice]);

  useEffect(
    () => () => {
      chart?.destroy();
    },
    [],
  );

  return (
    <div className="element-box less-padding">
      <h6 className="element-box-header text-center">Portfolio Distribution</h6>
      <div
        className="el-chart-w"
        style={{
          position: "relative",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <canvas ref={doughnutChartRef}></canvas>
        <div className="inside-donut-chart-label">
          <strong>{portFolioCoins.length}</strong>
          <span>Coins</span>
        </div>
      </div>

      <div className="el-legend condensed">
        <div className="row">
          {coinsWithPrice
            ?.sort((a, b) => +BigNumber(b.price).minus(a.price))
            .reduce<TokenData[][]>((acc, curr, index) => {
              const row = acc[index] || [];
              if (row.length < 2) {
                acc[index] = [...row, curr];
              } else {
                acc[index + 1] = [curr];
              }
              return acc;
            }, [])
            .map((row, rowIndex) => (
              <div
                key={"portfolio-highlight-row" + rowIndex}
                className={
                  rowIndex > 0 ? "col-sm-6 d-none d-xxxxl-block" : "col-auto col-xxxxl-6 ml-sm-auto mr-sm-auto"
                }
              >
                {row.map(({ tradeTokenAddr, identifier, balance, decimals }) => (
                  <PortfolioHighlight
                    key={identifier}
                    backgroundColor={getColor(tradeTokenAddr, 5)}
                    data={identifier}
                    title={prettyFormatAmount(balance, { length: 10, minLength: 16, decimals })}
                  />
                ))}{" "}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

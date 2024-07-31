import React, { useEffect, useMemo, useRef, useState } from "react";
import BigNumber from "bignumber.js";
import { ChartData } from "chart.js";
import useSWR from "swr";
import { useAccount, usePublicClient } from "wagmi";
import { useSwapableTokens } from "~~/components/Swap/hooks";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";
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
  const [width, setWidth] = useState<number>();
  const { address } = useAccount();
  const { tokens } = useSwapableTokens({ address });

  const doughnutChartRef = useRef<HTMLCanvasElement>(null);
  const { data: pairInfo } = useDeployedContractInfo("Pair");
  const client = usePublicClient();

  const { data: baseReserve } = useSWR(
    pairInfo && client ? { pairInfo, client, tokens } : null,
    ({ pairInfo, client, tokens }) => {
      const [basePair] = tokens.filter(token => token.identifier.includes("BASE"));

      return client.readContract({ abi: pairInfo.abi, address: basePair.pairAddr, functionName: "reserve" });
    },
  );

  const portFolioCoins = useMemo(() => tokens.filter(token => !BigNumber(token.balance).isZero()), [tokens]);

  const { data: coinReserves } = useSWR(
    client && pairInfo ? { pairInfo, client, coins: portFolioCoins } : null,
    ({ client, coins, pairInfo }) =>
      Promise.all(
        coins.map(coin => client.readContract({ abi: pairInfo.abi, address: coin.pairAddr, functionName: "reserve" })),
      ),
  );

  useEffect(() => {
    if (!coinReserves || !baseReserve) {
      return;
    }

    let values: any[] = [];
    let backgroundColor: string[] = [];
    let labels: string[] = [];

    for (let i = 0; i < portFolioCoins.length; i++) {
      const coin = portFolioCoins[i];
      const reserve = coinReserves[i];
      const { balance, tradeTokenAddr, identifier } = coin;

      const coinBasePrice = BigNumber(balance)
        .multipliedBy(baseReserve.toString())
        .dividedBy(reserve.toString())
        .toFixed(0);

      values.push(coinBasePrice);
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

    setWidth(Math.floor(chart.width * 1.1));
  }, [portFolioCoins, coinReserves, baseReserve]);

  useEffect(
    () => () => {
      chart?.destroy();
    },
    [],
  );

  return (
    <div style={{ width }} className="element-box less-padding">
      <h6 className="element-box-header text-center">Portfolio Distribution</h6>
      <div
        className="el-chart-w"
        style={{
          position: "relative",
          display: "flex",
          justifyContent: "center",
          minHeight: "150px",
          minWidth: "150px",
          left: "-7px",
        }}
      >
        <canvas
          // height='120'
          ref={doughnutChartRef}
          // width='120'
        ></canvas>
        <div className="inside-donut-chart-label">
          <strong>{portFolioCoins.length}</strong>
          <span>Coins</span>
        </div>
      </div>

      {/* <div className="el-chart-w">
        <div className="chartjs-size-monitor">
          <div className="chartjs-size-monitor-expand">
            <div className=""></div>
          </div>
          <div className="chartjs-size-monitor-shrink">
            <div className=""></div>
          </div>
        </div>
        <canvas
          height="292"
          id="donutChart1"
          width="292"
          style={{ display: "block", height: "146px", width: "146px" }}
          className="chartjs-render-monitor"
        ></canvas>
        <div className="inside-donut-chart-label">
          <strong>{portFolioCoins.length}</strong>
          <span>Coins</span>
        </div>
      </div> */}
    </div>
  );
}

"use client";
import { useId, useState } from "react";
import { marketMoney } from "@/lib/format";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import type { MarketCandle } from "@/lib/market-data/types";
export function PriceChart({
  bars,
  symbol,
  currency,
}: {
  bars: MarketCandle[];
  symbol: string;
  currency: string;
}) {
  const [period, setPeriod] = useState(60),
    id = useId().replaceAll(":", "");
  const points = bars.slice(-period),
    money = (v: number) =>
      marketMoney(v, currency, symbol.includes("/") ? 5 : undefined);
  return (
    <div className="price-chart">
      <div className="chart-toolbar">
        <span className="chart-legend">
          Daily closing price{currency ? " · " + currency : ""}
        </span>
        <div className="segmented" aria-label="Chart timeframe">
          {[
            [20, "1M"],
            [60, "3M"],
            [120, "6M"],
            [260, "1Y"],
          ]
            .filter(([n]) => bars.length >= Math.min(Number(n), 200))
            .map(([n, label]) => (
              <button
                type="button"
                key={n}
                aria-pressed={period === n}
                className={period === n ? "selected" : ""}
                onClick={() => setPeriod(Number(n))}
              >
                {label}
              </button>
            ))}
        </div>
      </div>
      <div
        className="chart-canvas"
        role="img"
        aria-label={`${symbol}: ${points.length} daily observations, ${money(points[0].close)} to ${money(points.at(-1)!.close)}`}
      >
        <ResponsiveContainer
          width="100%"
          height="100%"
          minWidth={0}
          initialDimension={{ width: 650, height: 320 }}
        >
          <AreaChart
            data={points}
            margin={{ top: 20, right: 4, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="var(--accent)"
                  stopOpacity={0.25}
                />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              vertical={false}
              stroke="var(--border)"
              strokeDasharray="2 6"
            />
            <XAxis
              dataKey="date"
              tickFormatter={(v) => String(v).slice(5, 10)}
              minTickGap={40}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--text-muted)", fontSize: 11 }}
            />
            <YAxis
              domain={["auto", "auto"]}
              orientation="right"
              width={64}
              tickFormatter={(v) =>
                Number(v).toLocaleString("en-US", {
                  maximumFractionDigits: symbol.includes("/") ? 5 : 1,
                })
              }
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--text-muted)", fontSize: 11 }}
            />
            <Tooltip
              formatter={(v) => [money(Number(v)), "Close"]}
              contentStyle={{
                background: "var(--surface-elevated)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                color: "var(--text-primary)",
              }}
            />
            <Area
              type="linear"
              dataKey="close"
              stroke="var(--accent)"
              strokeWidth={2}
              fill={`url(#${id})`}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="chart-footnote">
        <span>
          {points[0].date} — {points.at(-1)!.date}
        </span>
        <span>{points.length} observations</span>
      </div>
    </div>
  );
}

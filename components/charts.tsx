"use client";
import { useId, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import type { Equity, PriceBar } from "@/lib/demo-market";
import { money } from "@/lib/format";
const palette = [
  "#159b8e",
  "#243e54",
  "#71b6c4",
  "#b8ce70",
  "#b4a2c9",
  "#e2b46d",
  "#9caeba",
];
export function Sparkline({
  bars,
  positive = true,
}: {
  bars: PriceBar[];
  positive?: boolean;
}) {
  const values = bars.slice(-30).map((b) => b.close);
  const low = Math.min(...values),
    high = Math.max(...values);
  const points = values
    .map(
      (v, i) =>
        `${(i / (values.length - 1)) * 100},${28 - ((v - low) / (high - low || 1)) * 24}`,
    )
    .join(" ");
  return (
    <svg
      viewBox="0 0 100 32"
      className="sparkline"
      role="img"
      aria-label="Last 30 demo sessions price trend"
    >
      <polyline
        points={points}
        fill="none"
        stroke={positive ? "#168676" : "#c25463"}
        strokeWidth="1.6"
      />
    </svg>
  );
}
export function PriceChart({
  equity,
  compact = false,
}: {
  equity: Equity;
  compact?: boolean;
}) {
  const [period, setPeriod] = useState(60);
  const id = useId().replaceAll(":", "");
  const bars = equity.bars.slice(-period);
  return (
    <div className="price-chart">
      <div className="chart-toolbar">
        <span className="chart-legend">
          <i /> {equity.ticker} · Closing price (USD)
        </span>
        <div className="segmented" aria-label="Chart timeframe">
          {[
            [20, "1M"],
            [60, "3M"],
            [120, "6M"],
          ].map(([n, label]) => (
            <button
              key={n}
              type="button"
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
        className={compact ? "chart-canvas compact-chart" : "chart-canvas"}
        role="img"
        aria-label={`${equity.ticker}, ${bars.length} demonstration sessions, from ${money(bars[0].close)} to ${money(bars.at(-1)!.close)}`}
      >
        <ResponsiveContainer
          width="100%"
          height="100%"
          minWidth={0}
          initialDimension={{ width: 600, height: compact ? 220 : 300 }}
        >
          <AreaChart
            data={bars}
            margin={{ top: 15, right: 8, left: -18, bottom: 0 }}
          >
            <defs>
              <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#159b8e" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#159b8e" stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 5"
              stroke="#e5ebed"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              minTickGap={45}
              tickFormatter={(v) => String(v).slice(5)}
              tick={{ fill: "#84919a", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={["auto", "auto"]}
              tick={{ fill: "#84919a", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `$${Number(v).toFixed(0)}`}
            />
            <Tooltip
              formatter={(value) => [money(Number(value)), "Demo close"]}
              contentStyle={{
                border: "1px solid #dde5e8",
                borderRadius: 10,
                fontSize: 12,
              }}
            />
            <Area
              type="monotone"
              dataKey="close"
              stroke="#159b8e"
              strokeWidth={2.3}
              fill={`url(#${id})`}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="chart-footnote">
        <span>Simulated historical prices · Weekday observations</span>
        <span>{bars.length} sessions</span>
      </div>
    </div>
  );
}
export function AllocationChart({
  sectors,
}: {
  sectors: { name: string; value: number; weight: number }[];
}) {
  return (
    <div className="allocation">
      <div
        className="donut-canvas"
        role="img"
        aria-label={sectors
          .map((s) => `${s.name} ${s.weight.toFixed(1)}%`)
          .join(", ")}
      >
        <ResponsiveContainer
          width="100%"
          height="100%"
          initialDimension={{ width: 250, height: 220 }}
        >
          <PieChart>
            <Pie
              data={sectors}
              dataKey="value"
              nameKey="name"
              innerRadius={64}
              outerRadius={88}
              paddingAngle={3}
              stroke="none"
              isAnimationActive={false}
            >
              {sectors.map((s, i) => (
                <Cell key={s.name} fill={palette[i % palette.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(v) => money(Number(v))} />
          </PieChart>
        </ResponsiveContainer>
        <div className="donut-center">
          <strong>{sectors.length}</strong>
          <span>sectors</span>
        </div>
      </div>
      <div className="allocation-legend">
        {sectors.map((s, i) => (
          <div key={s.name}>
            <span>
              <i style={{ background: palette[i % palette.length] }} />
              {s.name}
            </span>
            <strong>{s.weight.toFixed(1)}%</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

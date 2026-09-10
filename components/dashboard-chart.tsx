"use client";
import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { equities, getEquity } from "@/lib/demo-market";
import { money } from "@/lib/format";
import { PriceChart } from "./charts";
import { SignalPanel } from "./signal-panel";
import { Change } from "./ui";
export function DashboardChart() {
  const [ticker, setTicker] = useState("NVDA");
  const equity = getEquity(ticker)!;
  return (
    <div className="analysis-grid">
      <section className="panel main-chart-panel">
        <div className="section-heading">
          <h2>Market lens</h2>
          <label className="sr-only" htmlFor="dashboard-equity">
            Chart equity
          </label>
          <select
            id="dashboard-equity"
            className="compact-select"
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
          >
            {equities.map((e) => (
              <option key={e.ticker}>{e.ticker}</option>
            ))}
          </select>
        </div>
        <div className="chart-company">
          <div>
            <Link href={`/research/${ticker}`} className="company-title">
              {equity.name}
              <ArrowUpRight size={17} />
            </Link>
            <span className="muted">
              {equity.ticker} · {equity.sector}
            </span>
          </div>
          <div className="chart-price">
            <strong>{money(equity.price)}</strong>
            <Change value={equity.change} />
          </div>
        </div>
        <PriceChart equity={equity} />
        <div className="sentiment-strip">
          <span>Demonstration sentiment</span>
          <strong>
            {equity.sentiment > 0.15
              ? "Constructive"
              : equity.sentiment < -0.15
                ? "Cautious"
                : "Balanced"}{" "}
            · {equity.sentiment.toFixed(2)}
          </strong>
          <span>Synthetic context, −1 to +1</span>
        </div>
      </section>
      <SignalPanel equity={equity} />
    </div>
  );
}

"use client";

import { useState } from "react";

import { analyzePortfolio } from "../lib/api";
import type { PortfolioHolding, PortfolioRiskReport } from "../lib/types";

const defaultHoldings: PortfolioHolding[] = [
  { ticker: "NVDA", shares: 8, average_cost: 118 },
  { ticker: "JPM", shares: 5, average_cost: 198 }
];

export function PortfolioClient() {
  const [holdings, setHoldings] = useState<PortfolioHolding[]>(defaultHoldings);
  const [report, setReport] = useState<PortfolioRiskReport | null>(null);

  function updateHolding(index: number, key: keyof PortfolioHolding, value: string) {
    setHoldings((current) =>
      current.map((holding, currentIndex) =>
        currentIndex === index
          ? {
              ...holding,
              [key]: key === "ticker" ? value.toUpperCase() : Number(value)
            }
          : holding
      )
    );
  }

  function addRow() {
    setHoldings((current) => [...current, { ticker: "AAPL", shares: 1, average_cost: 190 }]);
  }

  async function submit() {
    const analysis = await analyzePortfolio(holdings);
    setReport(analysis);
  }

  return (
    <div className="section-stack">
      <div className="panel">
        <h2>Portfolio analyzer</h2>
        <p>Enter holdings to compute concentration, sector exposure, and rebalance suggestions.</p>
        <div className="field-grid">
          {holdings.map((holding, index) => (
            <div className="field-grid two" key={`${holding.ticker}-${index}`}>
              <label>
                Ticker
                <input value={holding.ticker} onChange={(event) => updateHolding(index, "ticker", event.target.value)} />
              </label>
              <label>
                Shares
                <input
                  type="number"
                  min="1"
                  step="0.1"
                  value={holding.shares}
                  onChange={(event) => updateHolding(index, "shares", event.target.value)}
                />
              </label>
              <label>
                Average cost
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={holding.average_cost}
                  onChange={(event) => updateHolding(index, "average_cost", event.target.value)}
                />
              </label>
            </div>
          ))}
        </div>
        <div className="cta-row" style={{ marginTop: 18 }}>
          <button className="secondary" onClick={addRow}>
            Add holding
          </button>
          <button className="primary" onClick={submit}>
            Analyze risk
          </button>
        </div>
      </div>

      {report ? (
        <div className="grid-2">
          <div className="panel">
            <h2>Risk overview</h2>
            <div className="stats-row">
              <div className="metric">
                <span>Portfolio value</span>
                <strong>${report.portfolio_value.toFixed(2)}</strong>
              </div>
              <div className="metric">
                <span>Concentration score</span>
                <strong>{report.concentration_score.toFixed(2)}</strong>
              </div>
            </div>
            <ul className="inline-list" style={{ marginTop: 16 }}>
              {Object.entries(report.sector_exposure).map(([sector, weight]) => (
                <li className="pill" key={sector}>
                  {sector}: {(weight * 100).toFixed(0)}%
                </li>
              ))}
            </ul>
          </div>

          <div className="panel">
            <h2>Risk flags</h2>
            <div className="field-grid">
              {report.risk_flags.map((flag) => (
                <div className="pill" key={flag.title}>
                  <div className={`risk-chip risk-${flag.severity}`}>{flag.severity}</div>
                  <h3 style={{ marginTop: 10 }}>{flag.title}</h3>
                  <p>{flag.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {report ? (
        <div className="panel">
          <h2>Rebalance suggestions</h2>
          <ul className="field-grid">
            {report.rebalance_suggestions.map((suggestion) => (
              <li key={suggestion}>{suggestion}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}


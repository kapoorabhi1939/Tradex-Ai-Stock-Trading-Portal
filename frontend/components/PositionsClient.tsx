"use client";

import { useEffect, useState } from "react";

import { getComplianceStatus, getPositions, getRiskSnapshot } from "../lib/api";
import type { ComplianceStatus, PositionSnapshot, RiskSnapshot } from "../lib/types";

function currency(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(value);
}

export function PositionsClient() {
  const [positions, setPositions] = useState<PositionSnapshot[]>([]);
  const [risk, setRisk] = useState<RiskSnapshot | null>(null);
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);

  useEffect(() => {
    async function hydrate() {
      const [positionsResponse, riskResponse, complianceResponse] = await Promise.all([
        getPositions(),
        getRiskSnapshot(),
        getComplianceStatus()
      ]);
      setPositions(positionsResponse.positions);
      setRisk(riskResponse);
      setCompliance(complianceResponse);
    }

    hydrate();
  }, []);

  return (
    <div className="section-stack">
      {compliance ? (
        <div className={`compliance-banner banner-${compliance.banner_level}`}>
          <div>
            <strong>Compliance status</strong>
            <p>{compliance.banner_text}</p>
          </div>
          <span className="banner-chip">{compliance.kyc_status}</span>
        </div>
      ) : null}

      <div className="grid-3">
        <div className="metric">
          <span>Margin level</span>
          <strong>{risk ? `${risk.margin_level_pct.toFixed(1)}%` : "Loading"}</strong>
        </div>
        <div className="metric">
          <span>Drawdown used</span>
          <strong>{risk ? `${risk.drawdown_used_pct.toFixed(1)}%` : "Loading"}</strong>
        </div>
        <div className="metric">
          <span>Leverage tier</span>
          <strong>{risk?.leverage_tier ?? "Loading"}</strong>
        </div>
      </div>

      <div className="table-card">
        <h2>Portfolio positions registry view</h2>
        <p>
          This table implements the workbook fields for instrument ticker, quantity, average entry price, mark price,
          unrealized P&amp;L, leverage, and last trade time.
        </p>
        <table>
          <thead>
            <tr>
              <th>Ticker</th>
              <th>Company</th>
              <th>Qty</th>
              <th>Avg Entry</th>
              <th>Mark</th>
              <th>Unrealized P&amp;L</th>
              <th>Leverage</th>
              <th>Last Trade</th>
            </tr>
          </thead>
          <tbody>
            {positions.map((position) => (
              <tr key={position.position_id}>
                <td>{position.ticker}</td>
                <td>{position.company_name}</td>
                <td>{position.quantity}</td>
                <td>{position.avg_entry_price.toFixed(4)}</td>
                <td>{position.mark_price.toFixed(2)}</td>
                <td className={position.unrealized_pl >= 0 ? "text-positive" : "text-danger"}>{currency(position.unrealized_pl)}</td>
                <td>{position.leverage.toFixed(1)}x</td>
                <td>{new Date(position.last_trade_time).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

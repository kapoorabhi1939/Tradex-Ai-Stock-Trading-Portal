"use client";
import Link from "next/link";
import { useState } from "react";
import { Plus, Pencil, Trash2, ShieldCheck, AlertTriangle } from "lucide-react";
import { analyzePortfolio, type Holding } from "@/lib/portfolio";
import { money, percent } from "@/lib/format";
import { saveHolding, deleteHolding } from "@/app/actions/workspace";
import { ActionForm } from "./action-form";
import { TickerSelect } from "./ticker-select";
import { Panel, SectionTitle, Stat, EmptyState } from "./ui";
import { AllocationChart } from "./charts";
export function PortfolioManager({ holdings }: { holdings: Holding[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const editing = holdings.find((holding) => holding.id === editingId) ?? null;
  const report = analyzePortfolio(holdings);
  return (
    <>
      <div className="research-summary">
        <Stat
          label="Demo market value"
          value={money(report.total)}
          detail={`${holdings.length} saved position${holdings.length === 1 ? "" : "s"}`}
        />
        <Stat
          label="Unrealized gain / loss"
          value={
            <span className={report.gain >= 0 ? "positive" : "negative"}>
              {money(report.gain)}
            </span>
          }
          detail={`${percent(report.gainPercent)} on ${money(report.cost)} cost basis`}
        />
        <Stat
          label="Diversification score"
          value={holdings.length ? `${report.diversification}/100` : "—"}
          detail="Higher means more diversified"
        />
        <Stat
          label="Risk indicator"
          value={holdings.length ? `${report.risk}/100` : "—"}
          detail="Higher means greater modeled risk"
        />
      </div>
      <div className="portfolio-grid">
        <div className="stack">
          <Panel>
            <SectionTitle
              title={
                editing
                  ? `Edit ${editing.ticker} holding`
                  : "Build your portfolio"
              }
              sub="Track your exposure using demonstration prices. No orders are placed."
            />
            <ActionForm
              key={editing?.id ?? "new"}
              action={saveHolding}
              label={
                <>
                  <Plus size={16} />
                  {editing ? "Save changes" : "Add holding"}
                </>
              }
              className="holding-form"
            >
              {editing && <input type="hidden" name="id" value={editing.id} />}
              <TickerSelect defaultValue={editing?.ticker} />
              <label>
                Shares
                <input
                  name="shares"
                  type="number"
                  min="0.000001"
                  max="100000000"
                  step="0.000001"
                  placeholder="e.g. 10"
                  defaultValue={editing?.shares}
                  required
                />
              </label>
              <label>
                Average cost (USD)
                <input
                  name="average_cost"
                  type="number"
                  min="0"
                  max="1000000"
                  step="0.000001"
                  placeholder="e.g. 210.00"
                  defaultValue={editing?.average_cost}
                  required
                />
              </label>
            </ActionForm>
            {editing && (
              <button className="text-link" onClick={() => setEditingId(null)}>
                Done editing / Add another holding
              </button>
            )}
          </Panel>
          <Panel className="holdings-panel">
            <SectionTitle
              title="Your holdings"
              sub="Values and weights recalculate from saved positions"
            />
            {!holdings.length ? (
              <EmptyState title="Every portfolio starts with a position">
                Add your first holding above. Allocation, unrealized gain/loss,
                and risk analysis will appear here and stay saved across
                sessions.
              </EmptyState>
            ) : (
              <div className="table-scroll">
                <table>
                  <caption className="sr-only">
                    Saved portfolio holdings
                  </caption>
                  <thead>
                    <tr>
                      <th>Equity</th>
                      <th>Shares / Avg. cost</th>
                      <th>Value / Weight</th>
                      <th>Gain / loss</th>
                      <th>Manage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.positions.map((p) => (
                      <tr key={p.id}>
                        <td>
                          <Link
                            href={`/research/${p.ticker}`}
                            className="strong"
                          >
                            {p.ticker}
                          </Link>
                          <small className="table-secondary">
                            {p.equity.sector}
                          </small>
                        </td>
                        <td className="numeric">
                          {p.shares}
                          <small className="table-secondary">
                            {money(p.average_cost)}
                          </small>
                        </td>
                        <td className="numeric strong">
                          {money(p.value)}
                          <small className="table-secondary">
                            {p.weight.toFixed(1)}%
                          </small>
                        </td>
                        <td
                          className={`numeric ${p.gain >= 0 ? "positive" : "negative"}`}
                        >
                          {money(p.gain)}
                        </td>
                        <td>
                          <div className="row-actions">
                            <button
                              className="icon-button"
                              aria-label={`Edit ${p.ticker}`}
                              onClick={() => setEditingId(p.id)}
                            >
                              <Pencil size={15} />
                            </button>
                            <ActionForm
                              action={deleteHolding}
                              label={<Trash2 size={15} />}
                              accessibleLabel={`Delete ${p.ticker}`}
                              buttonClass="icon-button danger"
                              pendingLabel="…"
                              confirmMessage={`Remove ${p.ticker} from your portfolio?`}
                            >
                              <input type="hidden" name="id" value={p.id} />
                            </ActionForm>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>
        </div>
        <div className="stack">
          <Panel>
            <SectionTitle
              title="Sector allocation"
              sub="Share of current demonstration value"
            />
            {holdings.length ? (
              <AllocationChart sectors={report.sectors} />
            ) : (
              <div className="empty-donut">
                <span>
                  Allocation appears
                  <br />
                  after your first holding
                </span>
              </div>
            )}
          </Panel>
          <Panel>
            <SectionTitle title="Know your exposure" />
            <div className="risk-metrics">
              <div>
                <span>Largest position</span>
                <strong>{report.largestPosition.toFixed(1)}%</strong>
              </div>
              <div>
                <span>Largest sector</span>
                <strong>{report.largestSector.toFixed(1)}%</strong>
              </div>
              <div>
                <span>Concentration score</span>
                <strong>{report.concentration}/100</strong>
              </div>
              <div>
                <span>Weighted volatility proxy</span>
                <strong>{report.volatility.toFixed(1)}%</strong>
              </div>
            </div>
            {report.flags.map((flag) => (
              <div className="risk-flag" key={flag}>
                <AlertTriangle size={17} />
                <p>{flag}</p>
              </div>
            ))}
            {!!holdings.length && !report.flags.length && (
              <div className="insight-note">
                <ShieldCheck size={18} />
                <p>
                  No concentration thresholds exceeded. Diversification does not
                  eliminate market risk.
                </p>
              </div>
            )}
            <p className="muted small">
              A transparent concentration and historical volatility heuristic.
              It does not model correlations, liquidity, taxes, or future
              losses.
            </p>
          </Panel>
        </div>
      </div>
    </>
  );
}

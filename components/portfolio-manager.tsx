"use client";
import Link from "next/link";
import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { Holding } from "@/lib/portfolio";
import type { QuoteMap } from "@/lib/market-data/types";
import { valuePortfolio } from "@/lib/market-data/analytics";
import { money } from "@/lib/format";
import { saveHolding, deleteHolding } from "@/app/actions/workspace";
import { ActionForm } from "./action-form";
import { TickerSelect } from "./ticker-select";
import { Panel, SectionTitle, Stat, EmptyState } from "./ui";
export function PortfolioManager({
  holdings,
  quotes,
}: {
  holdings: Holding[];
  quotes: QuoteMap;
}) {
  const [editingId, setEditingId] = useState<string | null>(null),
    editing = holdings.find((h) => h.id === editingId) ?? null,
    report = valuePortfolio(holdings, quotes);
  return (
    <>
      <div className="research-summary">
        <Stat
          label={report.partial ? "Known market value" : "Current market value"}
          value={money(report.knownValue)}
          detail={
            report.pricedCount + " of " + holdings.length + " positions priced"
          }
        />
        <Stat
          label="Cost basis"
          value={money(report.cost)}
          detail="Saved acquisition costs"
        />
        <Stat
          label="Unrealized gain / loss"
          value={
            report.gain === null ? (
              "—"
            ) : (
              <span className={report.gain >= 0 ? "positive" : "negative"}>
                {money(report.gain)}
              </span>
            )
          }
          detail={
            report.partial
              ? "Full valuation unavailable"
              : "Across all positions"
          }
        />
        <Stat
          label="Largest exposure"
          value={
            report.positions.length && report.knownValue
              ? Math.max(
                  ...report.positions.map(
                    (p) => ((p.value ?? 0) / report.knownValue) * 100,
                  ),
                ).toFixed(1) + "%"
              : "—"
          }
          detail="Share of priced positions"
        />
      </div>
      {report.partial && (
        <p className="data-notice" role="status">
          Some quotes are unavailable. Known value includes only priced
          positions; total gain/loss remains unavailable. Your quantities and
          cost basis are unchanged.
        </p>
      )}
      {report.positions.some((p) => p.stale) && (
        <p className="data-notice">
          Some positions use the last successfully retrieved quote. Check the
          timestamp beside each position.
        </p>
      )}
      <div className="portfolio-grid">
        <div className="stack">
          <Panel>
            <SectionTitle
              title={
                editing
                  ? "Edit " + editing.ticker + " holding"
                  : "Add a position"
              }
              sub="Keep your acquisition price separate from the market price."
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
              sub="Market values calculated from your saved positions"
            />
            {report.positions.length ? (
              <div className="table-scroll">
                <table>
                  <caption className="sr-only">
                    Saved portfolio holdings
                  </caption>
                  <thead>
                    <tr>
                      <th>Instrument</th>
                      <th>Shares / Cost</th>
                      <th>Current value</th>
                      <th>Gain / loss</th>
                      <th>Manage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.positions.map((p) => (
                      <tr key={p.id}>
                        <td>
                          <Link
                            className="strong"
                            href={"/research/" + p.ticker}
                          >
                            {p.ticker}
                          </Link>
                          <small className="table-secondary">
                            {p.quote?.name ?? "Quote unavailable"}
                          </small>
                          <small className="table-secondary">
                            {p.quote
                              ? (p.stale ? "Cached · " : "") +
                                p.quote.timestamp
                                  .slice(0, 16)
                                  .replace("T", " ") +
                                " UTC"
                              : ""}
                          </small>
                        </td>
                        <td>
                          {p.shares}
                          <small className="table-secondary">
                            {money(p.average_cost)}
                          </small>
                        </td>
                        <td>{p.value === null ? "—" : money(p.value)}</td>
                        <td
                          className={
                            p.gain === null
                              ? "muted"
                              : p.gain >= 0
                                ? "positive"
                                : "negative"
                          }
                        >
                          {p.gain === null ? "—" : money(p.gain)}
                        </td>
                        <td>
                          <div className="row-actions">
                            <button
                              className="icon-button"
                              aria-label={"Edit " + p.ticker}
                              onClick={() => setEditingId(p.id)}
                            >
                              <Pencil size={15} />
                            </button>
                            <ActionForm
                              action={deleteHolding}
                              label={<Trash2 size={15} />}
                              accessibleLabel={"Delete " + p.ticker}
                              buttonClass="icon-button danger"
                              pendingLabel="…"
                              confirmMessage={
                                "Remove " + p.ticker + " from your portfolio?"
                              }
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
            ) : (
              <EmptyState title="Build your portfolio">
                Add a position to understand its current value and your
                exposure.
              </EmptyState>
            )}
          </Panel>
        </div>
        <Panel>
          <SectionTitle
            title="Position allocation"
            sub="Based on available USD market values"
          />
          {report.positions.map((p) => (
            <div className="allocation-row" key={p.id}>
              <div>
                <strong>{p.ticker}</strong>
                <span>
                  {p.value !== null && report.knownValue
                    ? ((p.value / report.knownValue) * 100).toFixed(1) + "%"
                    : "—"}
                </span>
              </div>
              <div className="allocation-track">
                <span
                  style={{
                    width:
                      p.value !== null && report.knownValue
                        ? (p.value / report.knownValue) * 100 + "%"
                        : "0%",
                  }}
                />
              </div>
            </div>
          ))}
          <p className="muted small">
            Position concentration{" "}
            {report.concentration === null
              ? "is unavailable"
              : report.concentration.toFixed(0) + "/100"}
            . Sector and volatility risk estimates require additional verified
            market information.
          </p>
        </Panel>
      </div>
    </>
  );
}

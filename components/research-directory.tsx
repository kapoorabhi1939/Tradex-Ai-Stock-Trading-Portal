"use client";
import Link from "next/link";
import { useState } from "react";
import { Search, ArrowUpRight } from "lucide-react";
import { equities } from "@/lib/demo-market";
import { calculateSignal } from "@/lib/signals";
import { compact, money } from "@/lib/format";
import { Change, SignalBadge, EmptyState } from "./ui";
import { Sparkline } from "./charts";
export function ResearchDirectory() {
  const [query, setQuery] = useState("");
  const [sector, setSector] = useState("all");
  const [sort, setSort] = useState("ticker");
  const rows = equities
    .filter(
      (e) =>
        `${e.ticker} ${e.name}`
          .toLowerCase()
          .includes(query.trim().toLowerCase()) &&
        (sector === "all" || e.sector === sector),
    )
    .map((e) => ({ ...e, indication: calculateSignal(e) }))
    .sort((a, b) =>
      sort === "confidence"
        ? b.indication.confidence - a.indication.confidence
        : sort === "change"
          ? b.change - a.change
          : a.ticker.localeCompare(b.ticker),
    );
  return (
    <section className="panel directory-panel">
      <div className="directory-toolbar">
        <label className="search-field">
          <Search size={18} />
          <span className="sr-only">Search equities</span>
          <input
            type="search"
            placeholder="Search ticker or company…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <div className="filter-group">
          <label>
            <span className="sr-only">Filter by sector</span>
            <select value={sector} onChange={(e) => setSector(e.target.value)}>
              <option value="all">All sectors</option>
              {[...new Set(equities.map((e) => e.sector))].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <label>
            <span className="sr-only">Sort equities</span>
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="ticker">Ticker A–Z</option>
              <option value="confidence">Highest confidence</option>
              <option value="change">Daily change</option>
            </select>
          </label>
        </div>
      </div>
      <div className="table-scroll">
        <table>
          <caption className="sr-only">
            Supported equities and demonstration analytics
          </caption>
          <thead>
            <tr>
              <th>Company</th>
              <th>Demo price</th>
              <th>Daily move</th>
              <th>30 sessions</th>
              <th>Model indication</th>
              <th>Confidence</th>
              <th>Market cap</th>
              <th>
                <span className="sr-only">Open research</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((e) => (
              <tr key={e.ticker}>
                <td>
                  <Link className="symbol-cell" href={`/research/${e.ticker}`}>
                    <span className="ticker-icon">{e.ticker[0]}</span>
                    <span>
                      <strong>
                        {e.ticker}
                        <small className="sector-tag">{e.sector}</small>
                      </strong>
                      <small>{e.name}</small>
                    </span>
                  </Link>
                </td>
                <td className="numeric strong">{money(e.price)}</td>
                <td>
                  <Change value={e.change} />
                </td>
                <td>
                  <Sparkline
                    bars={e.bars}
                    positive={e.bars.at(-1)!.close >= e.bars.at(-30)!.close}
                  />
                </td>
                <td>
                  <SignalBadge signal={e.indication.signal} />
                </td>
                <td>
                  <div className="mini-confidence">
                    <span>{e.indication.confidence}%</span>
                    <i>
                      <b style={{ width: `${e.indication.confidence}%` }} />
                    </i>
                  </div>
                </td>
                <td className="numeric">${compact(e.marketCap)}</td>
                <td>
                  <Link
                    className="icon-button"
                    href={`/research/${e.ticker}`}
                    aria-label={`Research ${e.ticker}`}
                  >
                    <ArrowUpRight size={17} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!rows.length && (
        <EmptyState title="No equities found">
          Try a different ticker, company name, or sector. This dataset covers
          12 US equities.
        </EmptyState>
      )}
      <div className="table-footer">
        <span>
          {rows.length} of {equities.length} equities
        </span>
        <span>All prices and metrics are demonstration values</span>
      </div>
    </section>
  );
}

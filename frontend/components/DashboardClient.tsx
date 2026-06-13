"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  addWatchlistItem,
  getAccountSummary,
  getAlerts,
  getComplianceStatus,
  getInstrumentMeta,
  getMarketDepth,
  getMarketStats,
  getMarketTrades,
  getOrders,
  getOverview,
  getPositions,
  getQuote,
  getRiskSnapshot,
  getSentiment,
  getSignal,
  getWatchlist
} from "../lib/api";
import type {
  AccountSummary,
  AlertRule,
  ComplianceStatus,
  InstrumentMeta,
  MarketDepthSnapshot,
  MarketQuote,
  MarketStats,
  OrderRecord,
  PositionSnapshot,
  RiskSnapshot,
  SentimentResult,
  SignalResult,
  SymbolOverview,
  TradesTape,
  WatchlistItem
} from "../lib/types";

function currency(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(value);
}

function percent(value: number) {
  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
}

function orderStatusClass(status: OrderRecord["status"]) {
  if (status === "FILLED") {
    return "status-positive";
  }
  if (status === "PARTIAL" || status === "PENDING" || status === "SUBMITTED") {
    return "status-warning";
  }
  if (status === "REJECTED" || status === "CANCELLED" || status === "EXPIRED") {
    return "status-danger";
  }
  return "status-neutral";
}

export function DashboardClient() {
  const [summary, setSummary] = useState<AccountSummary | null>(null);
  const [risk, setRisk] = useState<RiskSnapshot | null>(null);
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [positions, setPositions] = useState<PositionSnapshot[]>([]);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [alerts, setAlerts] = useState<AlertRule[]>([]);
  const [overview, setOverview] = useState<SymbolOverview | null>(null);
  const [quote, setQuote] = useState<MarketQuote | null>(null);
  const [signal, setSignal] = useState<SignalResult | null>(null);
  const [sentiment, setSentiment] = useState<SentimentResult | null>(null);
  const [stats, setStats] = useState<MarketStats | null>(null);
  const [depth, setDepth] = useState<MarketDepthSnapshot | null>(null);
  const [trades, setTrades] = useState<TradesTape | null>(null);
  const [meta, setMeta] = useState<InstrumentMeta | null>(null);
  const [selectedTicker, setSelectedTicker] = useState("AAPL");
  const [tickerInput, setTickerInput] = useState("AMZN");

  async function hydrateSymbol(ticker: string) {
    const symbol = ticker.toUpperCase();
    setSelectedTicker(symbol);

    const [overviewResult, quoteResult, signalResult, sentimentResult, statsResult, depthResult, tradesResult, metaResult] =
      await Promise.all([
        getOverview(symbol),
        getQuote(symbol),
        getSignal(symbol),
        getSentiment(symbol),
        getMarketStats(symbol),
        getMarketDepth(symbol),
        getMarketTrades(symbol),
        getInstrumentMeta(symbol)
      ]);

    setOverview(overviewResult);
    setQuote(quoteResult);
    setSignal(signalResult);
    setSentiment(sentimentResult);
    setStats(statsResult);
    setDepth(depthResult);
    setTrades(tradesResult);
    setMeta(metaResult);
  }

  useEffect(() => {
    async function hydrate() {
      const [summaryResult, riskResult, complianceResult, watchlistResponse, positionsResponse, ordersResponse, alertsResponse] =
        await Promise.all([
          getAccountSummary(),
          getRiskSnapshot(),
          getComplianceStatus(),
          getWatchlist(),
          getPositions(),
          getOrders(),
          getAlerts()
        ]);

      const currentWatchlist = watchlistResponse.items;
      setSummary(summaryResult);
      setRisk(riskResult);
      setCompliance(complianceResult);
      setWatchlist(currentWatchlist);
      setPositions(positionsResponse.positions);
      setOrders(ordersResponse.orders);
      setAlerts(alertsResponse.items);

      await hydrateSymbol(currentWatchlist[0]?.ticker ?? "AAPL");
    }

    hydrate();
  }, []);

  async function appendTicker() {
    const response = await addWatchlistItem(tickerInput.toUpperCase());
    setWatchlist(response.items);
  }

  return (
    <div className="section-stack">
      {compliance ? (
        <div className={`compliance-banner banner-${compliance.banner_level}`}>
          <div>
            <strong>KYC: {compliance.kyc_status}</strong>
            <p>{compliance.banner_text}</p>
          </div>
          <span className="banner-chip">{compliance.trading_restricted ? "Trading blocked" : "Trading enabled"}</span>
        </div>
      ) : null}

      <div className="grid-3">
        <div className="metric">
          <span>Total portfolio value</span>
          <strong>{summary ? currency(summary.total_portfolio_value) : "Loading"}</strong>
          <p className="muted">Source: GET /v1/account/summary</p>
        </div>
        <div className="metric">
          <span>Day change</span>
          <strong>{summary ? percent(summary.day_change_pct) : "Loading"}</strong>
          <p className="muted">Real-time when market is open, 15s poll fallback.</p>
        </div>
        <div className="metric">
          <span>Cash available</span>
          <strong>{summary ? currency(summary.cash_available) : "Loading"}</strong>
          <p className="muted">Staleness rule: disable withdraw CTA after 30s.</p>
        </div>
        <div className="metric">
          <span>Margin level</span>
          <strong>{risk ? `${risk.margin_level_pct.toFixed(1)}%` : "Loading"}</strong>
          <p className="muted">Band: {risk?.threshold_band ?? "pending"}</p>
        </div>
        <div className="metric">
          <span>Drawdown consumed</span>
          <strong>{risk ? `${risk.drawdown_used_pct.toFixed(1)}%` : "Loading"}</strong>
          <p className="muted">Leverage tier: {risk?.leverage_tier ?? "pending"}</p>
        </div>
        <div className="metric">
          <span>YTD return</span>
          <strong>{summary ? percent(summary.ytd_return_pct) : "Loading"}</strong>
          <p className="muted">Server-calculated; do not recompute client-side.</p>
        </div>
      </div>

      <div className="grid-2">
        <div className="panel">
          <h2>Watchlist and focus symbol</h2>
          <p>These cards map directly to the registry fields for ticker identity, top-level pricing, and signal state.</p>
          <div className="grid-3 compact-grid">
            {watchlist.map((item) => (
              <button className="watchlist-card" key={item.ticker} onClick={() => hydrateSymbol(item.ticker)} type="button">
                <span>{item.company_name}</span>
                <strong>{item.ticker}</strong>
                <p>{currency(item.latest_price)}</p>
                <div className={`signal-chip signal-${item.signal}`}>{item.signal} - {(item.confidence * 100).toFixed(0)}%</div>
              </button>
            ))}
          </div>
          <div className="field-grid two">
            <label>
              Add ticker
              <input value={tickerInput} onChange={(event) => setTickerInput(event.target.value.toUpperCase())} />
            </label>
            <button className="primary" onClick={appendTicker} style={{ alignSelf: "end" }} type="button">
              Add to watchlist
            </button>
          </div>
        </div>

        <div className="panel">
          <h2>{selectedTicker} market snapshot</h2>
          <div className="stats-row">
            <div className="metric">
              <span>Mark price</span>
              <strong>{quote ? quote.mark_price.toFixed(2) : "--"}</strong>
            </div>
            <div className="metric">
              <span>Bid / Ask</span>
              <strong>{quote ? `${quote.bid.toFixed(2)} / ${quote.ask.toFixed(2)}` : "--"}</strong>
            </div>
            <div className="metric">
              <span>24h volume</span>
              <strong>{stats ? stats.volume_24h.toLocaleString() : "--"}</strong>
            </div>
          </div>
          {meta ? (
            <div className="field-grid" style={{ marginTop: 18 }}>
              <div className="status-inline">
                <span className="label-chip">Leverage {meta.leverage.toFixed(1)}x</span>
                <span className={`label-chip ${meta.restricted ? "chip-danger" : "chip-positive"}`}>
                  {meta.restricted ? "Restricted" : "Tradeable"}
                </span>
              </div>
              {meta.restricted ? <p>{meta.restriction_reason}</p> : null}
              <p className="muted">
                Last trade: {stats ? new Date(stats.last_trade_time).toLocaleString() : "--"} | Quote freshness window:{" "}
                {quote?.freshness.stale_after_seconds ?? "--"}s
              </p>
              <Link className="button secondary" href={`/symbol/${selectedTicker}`}>
                Open full symbol page
              </Link>
            </div>
          ) : null}
        </div>
      </div>

      <div className="grid-2">
        <div className="panel">
          <h2>Signal and sentiment</h2>
          {signal ? (
            <>
              <div className={`signal-chip signal-${signal.signal}`}>
                {signal.signal} - {(signal.confidence * 100).toFixed(0)}% confidence
              </div>
              <p>{signal.explanation}</p>
              <p className="muted">Generated at {new Date(signal.generated_at).toLocaleString()}</p>
              <ul className="inline-list">
                {signal.features_used.map((feature) => (
                  <li className="pill" key={feature}>
                    {feature.replaceAll("_", " ")}
                  </li>
                ))}
              </ul>
            </>
          ) : null}
          {sentiment ? (
            <div style={{ marginTop: 18 }}>
              <div className={`sentiment-chip sentiment-${sentiment.label}`}>
                {sentiment.label} - score {sentiment.score.toFixed(2)}
              </div>
              <p>{sentiment.summary}</p>
              <p className="muted">{sentiment.headline_count} headlines analyzed.</p>
            </div>
          ) : null}
        </div>

        <div className="panel">
          <h2>Alerts and margin workflow</h2>
          {risk ? (
            <div className="field-grid">
              <div className={`status-chip status-${risk.threshold_band}`}>
                Margin band: {risk.threshold_band.replaceAll("_", " ")}
              </div>
              <p>{risk.freshness.message}</p>
              <p className="muted">
                {risk.blocks_new_levered_orders
                  ? "New levered orders should be blocked right now."
                  : "New levered orders remain available in this demo state."}
              </p>
            </div>
          ) : null}
          <div className="field-grid" style={{ marginTop: 18 }}>
            {alerts.map((alert) => (
              <div className="pill" key={alert.alert_id}>
                <strong>{alert.ticker}</strong>
                <p>
                  {alert.condition_type.replaceAll("_", " ")} at {alert.threshold}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div className="table-card">
          <h2>Positions</h2>
          <table>
            <thead>
              <tr>
                <th>Ticker</th>
                <th>Qty</th>
                <th>Avg entry</th>
                <th>Mark</th>
                <th>Unrealized P&amp;L</th>
              </tr>
            </thead>
            <tbody>
              {positions.slice(0, 5).map((position) => (
                <tr key={position.position_id}>
                  <td>{position.ticker}</td>
                  <td>{position.quantity}</td>
                  <td>{position.avg_entry_price.toFixed(4)}</td>
                  <td>{position.mark_price.toFixed(2)}</td>
                  <td className={position.unrealized_pl >= 0 ? "text-positive" : "text-danger"}>{currency(position.unrealized_pl)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Link className="button secondary" href="/positions" style={{ marginTop: 18 }}>
            Open positions workspace
          </Link>
        </div>

        <div className="table-card">
          <h2>Orders lifecycle</h2>
          <table>
            <thead>
              <tr>
                <th>Ticker</th>
                <th>Type</th>
                <th>Status</th>
                <th>Filled</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 5).map((order) => (
                <tr key={order.order_id}>
                  <td>{order.ticker}</td>
                  <td>{order.order_type}</td>
                  <td>
                    <span className={`status-chip ${orderStatusClass(order.status)}`}>{order.status}</span>
                  </td>
                  <td>
                    {order.filled_quantity}/{order.total_quantity}
                    {order.needs_reconcile ? <span className="reconcile-badge">Reconcile</span> : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Link className="button secondary" href="/orders" style={{ marginTop: 18 }}>
            Open orders workspace
          </Link>
        </div>
      </div>

      <div className="grid-2">
        <div className="table-card">
          <h2>Order book</h2>
          <div className="depth-grid">
            <div>
              <h3>Bids</h3>
              <table>
                <tbody>
                  {depth?.bids.map((level) => (
                    <tr key={`bid-${level.price}`}>
                      <td>{level.price.toFixed(2)}</td>
                      <td>{level.size.toFixed(0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div>
              <h3>Asks</h3>
              <table>
                <tbody>
                  {depth?.asks.map((level) => (
                    <tr key={`ask-${level.price}`}>
                      <td>{level.price.toFixed(2)}</td>
                      <td>{level.size.toFixed(0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="table-card">
          <h2>Time and sales</h2>
          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>Price</th>
                <th>Size</th>
                <th>Side</th>
              </tr>
            </thead>
            <tbody>
              {trades?.ticks.map((tick) => (
                <tr key={`${tick.timestamp}-${tick.price}-${tick.size}`}>
                  <td>{new Date(tick.timestamp).toLocaleTimeString()}</td>
                  <td>{tick.price.toFixed(2)}</td>
                  <td>{tick.size}</td>
                  <td className={tick.side === "buy" ? "text-positive" : "text-danger"}>{tick.side}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

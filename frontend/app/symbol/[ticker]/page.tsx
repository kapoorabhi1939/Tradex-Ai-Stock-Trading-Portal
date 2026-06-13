import { Disclaimer } from "../../../components/Disclaimer";
import { getInstrumentMeta, getMarketStats, getOverview, getQuote, getSentiment, getSignal } from "../../../lib/api";

export default async function SymbolPage({ params }: { params: Promise<{ ticker: string }> }) {
  const { ticker } = await params;
  const symbol = ticker.toUpperCase();
  const [overview, quote, signal, sentiment, stats, meta] = await Promise.all([
    getOverview(symbol),
    getQuote(symbol),
    getSignal(symbol),
    getSentiment(symbol),
    getMarketStats(symbol),
    getInstrumentMeta(symbol)
  ]);

  return (
    <main className="section-stack">
      <section className="hero">
        <div className="eyebrow">Symbol Deep Dive</div>
        <h1>{overview.ticker}</h1>
        <p>{overview.description}</p>
        <div className="stats-row">
          <div className="metric">
            <span>Price</span>
            <strong>${overview.latest_price.toFixed(2)}</strong>
          </div>
          <div className="metric">
            <span>Daily move</span>
            <strong>
              {overview.price_change >= 0 ? "+" : ""}
              {overview.price_change.toFixed(2)} ({overview.price_change_percent.toFixed(2)}%)
            </strong>
          </div>
          <div className="metric">
            <span>24h volume</span>
            <strong>{stats.volume_24h.toLocaleString()}</strong>
          </div>
        </div>
      </section>

      <div className="grid-2">
        <div className="panel">
          <h2>Quote and restrictions</h2>
          <div className="status-inline">
            <span className="label-chip">Mark {quote.mark_price.toFixed(2)}</span>
            <span className="label-chip">Bid {quote.bid.toFixed(2)}</span>
            <span className="label-chip">Ask {quote.ask.toFixed(2)}</span>
            <span className={`label-chip ${meta.restricted ? "chip-danger" : "chip-positive"}`}>
              {meta.restricted ? "Restricted" : "Tradeable"}
            </span>
          </div>
          <p className="muted" style={{ marginTop: 16 }}>
            Last trade {new Date(stats.last_trade_time).toLocaleString()} | Leverage {meta.leverage.toFixed(1)}x
          </p>
          {meta.restricted ? <p>{meta.restriction_reason}</p> : null}
        </div>

        <div className="panel">
          <h2>Signal output</h2>
          <div className={`signal-chip signal-${signal.signal}`}>
            {signal.signal} - {(signal.confidence * 100).toFixed(0)}% confidence
          </div>
          <p>{signal.explanation}</p>
          <p className="muted">Generated at {new Date(signal.generated_at).toLocaleString()}</p>
        </div>
      </div>

      <div className="grid-2">
        <div className="panel">
          <h2>Sentiment output</h2>
          <div className={`sentiment-chip sentiment-${sentiment.label}`}>
            {sentiment.label} - score {sentiment.score.toFixed(2)}
          </div>
          <p>{sentiment.summary}</p>
          <p className="muted">{sentiment.headline_count} headlines scanned.</p>
        </div>

        <div className="panel">
          <h2>Registry notes</h2>
          <ul className="field-grid">
            <li>Quote staleness window: {quote.freshness.stale_after_seconds}s</li>
            <li>Market stats staleness window: {stats.freshness.stale_after_seconds}s</li>
            <li>Restriction path: GET /v1/instruments/{symbol}/restrictions</li>
          </ul>
        </div>
      </div>

      <div className="table-card">
        <h2>Recent price bars</h2>
        <table>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Open</th>
              <th>High</th>
              <th>Low</th>
              <th>Close</th>
            </tr>
          </thead>
          <tbody>
            {overview.recent_bars.slice(-10).map((bar) => (
              <tr key={bar.timestamp}>
                <td>{new Date(bar.timestamp).toLocaleString()}</td>
                <td>{bar.open.toFixed(2)}</td>
                <td>{bar.high.toFixed(2)}</td>
                <td>{bar.low.toFixed(2)}</td>
                <td>{bar.close.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Disclaimer />
    </main>
  );
}

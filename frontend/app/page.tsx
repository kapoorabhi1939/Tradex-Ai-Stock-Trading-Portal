import Link from "next/link";

import { Disclaimer } from "../components/Disclaimer";

export default function HomePage() {
  return (
    <main className="section-stack">
      <section className="hero">
        <div className="hero-grid">
          <div>
            <div className="eyebrow">Decision-Support Investing</div>
            <h1>See the signal, the sentiment, and the risk in one place.</h1>
            <p>
              Tradex AI turns delayed US equities data into explainable market signals, compact news sentiment, and
              portfolio risk guidance. It is designed for smarter analysis, not automatic order execution.
            </p>
            <div className="cta-row">
              <Link className="button primary" href="/dashboard">
                Open dashboard
              </Link>
              <Link className="button secondary" href="/portfolio">
                Analyze a portfolio
              </Link>
              <Link className="button secondary" href="/orders">
                Review orders
              </Link>
            </div>
          </div>

          <div className="panel">
            <h2>What the MVP includes</h2>
            <div className="pill-row" style={{ marginTop: 18 }}>
              <div className="pill">Explainable bullish, neutral, and bearish signals</div>
              <div className="pill">News sentiment summaries with confidence context</div>
              <div className="pill">Portfolio concentration and sector-risk analysis</div>
              <div className="pill">Watchlists, alerts, auth, and API-backed dashboard flows</div>
              <div className="pill">Order lifecycle, market depth, and compliance registry states</div>
            </div>
          </div>
        </div>

        <div className="stats-row">
          <div className="metric">
            <span>Data mode</span>
            <strong>Minute-level / delayed</strong>
          </div>
          <div className="metric">
            <span>Universe</span>
            <strong>US equities</strong>
          </div>
          <div className="metric">
            <span>Execution</span>
            <strong>No broker routing</strong>
          </div>
        </div>
      </section>

      <section className="grid-3">
        <div className="panel">
          <h2>Signal engine</h2>
          <p>Combines moving averages, momentum, realized volatility, and sentiment inputs into a simple directional score.</p>
        </div>
        <div className="panel">
          <h2>Sentiment engine</h2>
          <p>Turns fresh headlines into positive, neutral, or negative context so the dashboard can explain market tone.</p>
        </div>
        <div className="panel">
          <h2>Risk engine</h2>
          <p>Measures concentration, sector exposure, and volatility signals to surface practical rebalance suggestions.</p>
        </div>
      </section>

      <Disclaimer />
    </main>
  );
}

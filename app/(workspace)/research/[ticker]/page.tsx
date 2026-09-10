import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Plus, Newspaper, ArrowUpRight } from "lucide-react";
import { getEquity, demoHeadlines } from "@/lib/demo-market";
import { getWorkspace } from "@/lib/workspace";
import { money, compact } from "@/lib/format";
import { addWatchlist } from "@/app/actions/workspace";
import { ActionForm } from "@/components/action-form";
import { PriceChart } from "@/components/charts";
import { SignalPanel } from "@/components/signal-panel";
import { Panel, Stat, Change, SectionTitle, DemoBadge } from "@/components/ui";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ ticker: string }>;
}) {
  const { ticker } = await params;
  return { title: `${ticker.toUpperCase()} research` };
}
export default async function SymbolDetail({
  params,
}: {
  params: Promise<{ ticker: string }>;
}) {
  const { ticker } = await params;
  const equity = getEquity(ticker);
  if (!equity) notFound();
  const data = await getWorkspace();
  const followed = data.watchlist.some((item) => item.ticker === equity.ticker);
  return (
    <>
      <Link href="/research" className="text-link back-link">
        <ArrowLeft size={15} /> Equity research
      </Link>
      <div className="symbol-heading">
        <div className="symbol-cell">
          <span className="ticker-icon large">{equity.ticker[0]}</span>
          <div>
            <p className="eyebrow">
              {equity.ticker} / {equity.sector}
            </p>
            <h1>{equity.name}</h1>
          </div>
        </div>
        {followed ? (
          <Link className="button secondary" href="/dashboard">
            ✓ In your watchlist
          </Link>
        ) : (
          <ActionForm
            action={addWatchlist}
            label={
              <>
                <Plus size={16} /> Add to watchlist
              </>
            }
          >
            <input type="hidden" name="ticker" value={equity.ticker} />
          </ActionForm>
        )}
      </div>
      <p className="symbol-description muted">{equity.description}</p>
      <div className="analysis-grid">
        <Panel className="main-chart-panel">
          <div className="symbol-quote">
            <div>
              <strong>{money(equity.price)}</strong>
              <Change value={equity.change} />
              <span>USD · Daily move</span>
            </div>
            <DemoBadge />
          </div>
          <PriceChart equity={equity} />
          <div className="stats-row three">
            <Stat
              label="Demo market cap"
              value={`$${compact(equity.marketCap)}`}
            />
            <Stat label="Demo daily volume" value={compact(equity.volume)} />
            <Stat
              label="Historical volatility"
              value={`${equity.volatility.toFixed(1)}%`}
              detail="Annualized · Last 60 returns"
            />
          </div>
        </Panel>
        <SignalPanel equity={equity} />
      </div>
      <div className="lower-grid">
        <Panel>
          <SectionTitle
            title="The conversation around the company"
            sub="Synthetic headlines · Illustrative scenarios, not current news"
          />
          <div className="headlines">
            {demoHeadlines(equity).map((h) => (
              <article key={h.title}>
                <Newspaper size={19} />
                <div>
                  <span className="eyebrow">{h.source}</span>
                  <h3>{h.title}</h3>
                  <small>{h.time}</small>
                </div>
              </article>
            ))}
          </div>
        </Panel>
        <div className="stack">
          <Panel>
            <SectionTitle
              title="Sentiment context"
              sub="Seeded demonstration input"
            />
            <div className="sentiment-number">
              {equity.sentiment > 0 ? "+" : ""}
              {equity.sentiment.toFixed(2)}
              <span>
                {equity.sentiment > 0.15
                  ? "Constructive"
                  : equity.sentiment < -0.15
                    ? "Cautious"
                    : "Balanced"}
              </span>
            </div>
            <div className="sentiment-scale">
              <i style={{ left: `${(equity.sentiment + 1) * 50}%` }} />
            </div>
            <div className="scale-labels">
              <span>−1 Negative</span>
              <span>+1 Positive</span>
            </div>
            <p className="muted small">
              A fictional context factor with a 10% model weight. No news feed
              or language model is connected.
            </p>
          </Panel>
          <Panel>
            <SectionTitle title="Continue your research" />
            {equity.related.map((t) => (
              <Link className="related-row" href={`/research/${t}`} key={t}>
                <div>
                  <strong>{t}</strong>
                  <span>{getEquity(t)!.name}</span>
                </div>
                <ArrowUpRight size={17} />
              </Link>
            ))}
          </Panel>
        </div>
      </div>
    </>
  );
}

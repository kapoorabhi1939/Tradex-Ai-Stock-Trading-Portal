import Link from "next/link";
import { getWorkspace } from "@/lib/workspace";
import { getAsset, market } from "@/lib/market-data/provider";
import { valuePortfolio } from "@/lib/market-data/analytics";
import {
  Panel,
  PageHeading,
  SectionTitle,
  Stat,
  Change,
} from "@/components/ui";
import { MarketWorkspace, quotePrice } from "@/components/market-workspace";
import { Watchlist } from "@/components/watchlist";
import { money } from "@/lib/format";
import { symbolKey } from "@/lib/market-data/normalizers";
import { InsightCard } from "@/components/insight-card";
export const metadata = { title: "Dashboard" };
export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ symbol?: string }>;
}) {
  const data = await getWorkspace(),
    params = await searchParams;
  let selected = "AAPL";
  try {
    selected = symbolKey(params.symbol ?? "AAPL");
  } catch {}
  const symbols = [
    ...new Set([
      selected,
      ...data.watchlist.map((i) => i.ticker),
      ...data.holdings.map((h) => h.ticker),
    ]),
  ];
  const [asset, quotes] = await Promise.all([
      getAsset(selected),
      market.quotes(symbols),
    ]),
    portfolio = valuePortfolio(data.holdings, quotes);
  return (
    <>
      <PageHeading
        eyebrow="YOUR WORKSPACE"
        title="Market overview"
        description="A focused view of your markets, positions and next move."
      />
      <div className="market-ribbon">
        {symbols.slice(0, 5).map((s) => {
          const q = quotes[s]?.data;
          return (
            <Link
              prefetch={false}
              href={"/dashboard?symbol=" + encodeURIComponent(s)}
              className={"market-tile" + (s === selected ? " selected" : "")}
              key={s}
            >
              <span>
                {q?.symbol ?? s}
                <small>{q?.name ?? "Market data unavailable"}</small>
              </span>
              <div>
                <strong>{q ? quotePrice(q) : "—"}</strong>
                {q?.percentChange !== null &&
                  q?.percentChange !== undefined && (
                    <Change value={q.percentChange} />
                  )}
              </div>
            </Link>
          );
        })}
      </div>
      <MarketWorkspace
        asset={asset}
        lens
        saved={data.watchlist.some(
          (i) => i.ticker === asset.quote.data?.symbol,
        )}
      />
      <div className="lower-grid">
        <Panel>
          <SectionTitle
            title="Watchlist"
            sub={data.watchlist.length + " saved instruments"}
            href="/research"
            link="Discover"
          />
          <Watchlist items={data.watchlist} quotes={quotes} />
        </Panel>
        <div className="stack">
          <Panel>
            <SectionTitle
              title="Portfolio snapshot"
              href="/portfolio"
              link="View positions"
            />
            <div className="stats-row two">
              <Stat
                label={
                  portfolio.partial ? "Priced positions only" : "Current value"
                }
                value={money(portfolio.knownValue)}
                detail={
                  portfolio.pricedCount +
                  " of " +
                  data.holdings.length +
                  " positions priced"
                }
              />
              <Stat
                label="Cost basis"
                value={money(portfolio.cost)}
                detail="Your saved acquisition costs"
              />
            </div>
          </Panel>
          <Panel>
            <SectionTitle
              title="Recent activity"
              href="/alerts"
              link="Alerts"
            />
            {data.activity.length ? (
              data.activity.slice(0, 2).map((a) => (
                <div className="activity-entry" key={a.id}>
                  <strong>{a.ticker} · Condition matched</strong>
                  <p>
                    {new Date(a.triggered_at).toLocaleString("en-US", {
                      timeZone: "UTC",
                    })}{" "}
                    UTC
                  </p>
                </div>
              ))
            ) : (
              <p className="muted">
                No alert activity yet. Create a rule to track a price or signal.
              </p>
            )}
          </Panel>
        </div>
      </div>
      <section className="dashboard-insight">
        <SectionTitle
          title="Tradex Insights"
          sub="Research practices and editorial market context."
          href="/insights"
          link="View insights"
        />
        <InsightCard
          eyebrow="RESEARCH PRACTICE"
          title="Set the evidence before the alert"
        >
          Decide what would confirm or challenge your view, then use a focused
          alert to revisit it.
        </InsightCard>
      </section>
    </>
  );
}
